// Core Collective - CI pipeline (Jenkins Declarative, Windows agent)
//
// Mirrors .github/workflows/ci.yml minus the registry push:
//   web     -> Next.js 14 : npm ci -> test -> build
//   backend -> NestJS 11  : npm ci -> build -> test
//   docker  -> optional, validates both Dockerfiles compile (no push)
//   vercel  -> optional, links + deploys the Next.js app to Vercel production
//
// Vercel requirements:
//   * Jenkins secret text credential `vercel-token` (Vercel access token)
//   * `VERCEL_PROJECT` below must match the Vercel project name, and the token
//     must belong to the scope that owns it (set VERCEL_SCOPE for team projects)
//
// Agent requirements (Windows):
//   * Node.js >= 22 and npm on the agent PATH
//   * git on the agent PATH (Jenkins also resolves it via Global Tool Config)
//   * docker CLI on the agent PATH, and RUN_DOCKER=true, to run the Docker stage
//
// No secrets are needed: the .env files are git-ignored, and the web build was
// verified to succeed with no NEXT_PUBLIC_* set (src/lib/supabase.js returns
// null server-side instead of throwing).
//
// ESCAPING: `bat '''...'''` and `powershell '''...'''` are Groovy GStrings, so
// Groovy interpolates $name before the shell/PowerShell ever sees it. Every
// PowerShell variable below is written \$name; only ${env.BUILD_NUMBER} is meant
// to be interpolated.

pipeline {
    agent any

    parameters {
        booleanParam(
            name: 'RUN_LINT',
            defaultValue: false,
            description: 'Run eslint on the Next.js app. Off by default: lint is not part of the GitHub Actions gate, and `npm run lint` in backend/ rewrites files (eslint --fix).'
        )
        booleanParam(
            name: 'RUN_DOCKER',
            defaultValue: false,
            description: 'Also build both Docker images. Off by default: Docker Desktop here is a per-user install, so the Jenkins service (LocalSystem) cannot reach the docker CLI or the daemon until that is sorted out.'
        )
        booleanParam(
            name: 'DEPLOY_VERCEL',
            defaultValue: false,
            description: 'Deploy the Next.js app to Vercel production. Requires the `vercel-token` Jenkins credential.'
        )
        string(
            name: 'VERCEL_PROJECT',
            defaultValue: 'buy-allproduts-corecollective',
            description: 'Vercel project to deploy to. Must match the project name in the Vercel dashboard; the production domain is <project>.vercel.app.'
        )
        string(
            name: 'VERCEL_SCOPE',
            defaultValue: '',
            description: 'Vercel team slug to deploy under. Leave blank for a personal account project.'
        )
    }

    options {
        timestamps()
        timeout(time: 45, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '5'))
        skipDefaultCheckout(true)
    }

    environment {
        CI = 'true'
        NPM_CONFIG_AUDIT = 'false'
        NPM_CONFIG_FUND = 'false'
        NEXT_TELEMETRY_DISABLED = '1'
        DOCKER_BUILDKIT = '1'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify toolchain') {
            steps {
                powershell '''
                    \$ErrorActionPreference = 'Stop'

                    foreach (\$bin in @('git', 'node', 'npm')) {
                        if (-not (Get-Command \$bin -ErrorAction SilentlyContinue)) {
                            Write-Host "::error::\$bin is not on this agent's PATH"
                            exit 1
                        }
                    }

                    if (\$env:RUN_DOCKER -eq 'true' -and -not (Get-Command docker -ErrorAction SilentlyContinue)) {
                        Write-Host '::error::RUN_DOCKER is enabled but the docker CLI is not on this agent PATH'
                        exit 1
                    }

                    \$major = [int] (node -p process.versions.node).Split('.')[0]
                    if (\$major -lt 22) {
                        Write-Host "::error::Node \$(node -v) found, Node 22+ required"
                        exit 1
                    }
                    Write-Host "node \$(node -v) / npm \$(npm -v)"

                    foreach (\$lock in @('package-lock.json', 'backend/package-lock.json')) {
                        if (-not (Test-Path \$lock)) {
                            Write-Host "::error::\$lock is missing"
                            exit 1
                        }
                    }
                '''
            }
        }

        stage('CI') {
            parallel {
                stage('Web (Next.js)') {
                    steps {
                        bat 'npm ci && npm test && npm run build'
                    }
                }

                stage('Backend (NestJS)') {
                    steps {
                        dir('backend') {
                            bat 'npm ci && npm run build && npm test'
                        }
                    }
                }
            }
        }

        // Sequential, not inside the parallel block above: `npm run lint` needs
        // the devDependencies that `npm ci` installs. Running it in parallel
        // races the install and dies with "eslint is not recognized".
        stage('Lint') {
            when { expression { params.RUN_LINT } }
            steps {
                bat 'npm run lint'
            }
        }

        stage('Docker build') {
            when { expression { params.RUN_DOCKER } }
            steps {
                bat '''
                    @echo off

                    docker info >nul 2>&1
                    if errorlevel 1 (
                        echo ::error::Docker daemon not reachable from the Jenkins service. Docker Desktop is a per-user install; the service runs as LocalSystem.
                        exit /b 1
                    )

                    docker buildx version >nul 2>&1
                    if errorlevel 1 (
                        echo ::error::docker buildx is not visible to the Jenkins service account.
                        echo ::error::Both Dockerfiles use RUN --mount=type=cache, so BuildKit is required and there is no legacy fallback.
                        echo ::error::The service runs as LocalSystem, whose DOCKER_CONFIG is C:\\Windows\\System32\\config\\systemprofile\\.docker
                        echo ::error::Fix from an ELEVATED prompt: copy docker-buildx.exe into the cli-plugins folder there
                        echo ::error::Avoid C:\\ProgramData\\Docker\\cli-plugins - Docker CLI 29.2.0 removed that search path in CVE-2025-15558
                        exit /b 1
                    )

                    set "TAG=build-%BUILD_NUMBER%"
                    set "LABEL=jenkins.core-collective.build=%BUILD_NUMBER%"
                    docker build --label "%LABEL%" -t "core-collective-backend:%TAG%" -f backend/Dockerfile backend || exit /b 1
                    docker build --label "%LABEL%" -t "core-collective-web:%TAG%" -f Dockerfile . || exit /b 1
                    docker image ls --filter "label=%LABEL%"
                '''
            }
        }

        stage('Deploy Frontend to Vercel') {
            when {
                allOf {
                    expression { params.DEPLOY_VERCEL }
                    // This is a --prod deploy, so refuse to run it off a feature
                    // branch or a tag build. Detached HEAD fails `branch` too.
                    branch 'main'
                }
            }
            steps {
                withCredentials([
                    string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN')
                ]) {
                    bat '''
                        @echo off

                        set "SCOPE="
                        if not "%VERCEL_SCOPE%"=="" set "SCOPE=--scope %VERCEL_SCOPE%"

                        rem `--name` is deprecated upstream. Link the checkout to the
                        rem existing project instead: this writes .vercel/project.json,
                        rem which is what `vercel deploy` needs to resolve the target,
                        rem and it fails loudly if the project does not exist rather
                        rem than silently creating a second one.
                        npx --yes vercel@latest link --project "%VERCEL_PROJECT%" --yes --token "%VERCEL_TOKEN%" %SCOPE% || exit /b 1

                        rem No --prebuilt: let Vercel run the Next.js build so the
                        rem build uses the project env vars and build cache already
                        rem configured on Vercel. --logs pipes the remote build output
                        rem into the Jenkins console. Exits non-zero if the build fails.
                        npx --yes vercel@latest deploy --prod --yes --logs --token "%VERCEL_TOKEN%" %SCOPE%
                    '''
                }
            }
        }
    }

    post {
        always {
            bat '''
                @echo off
                if "%RUN_DOCKER%"=="true" docker image prune -f --filter "label=jenkins.core-collective.build=%BUILD_NUMBER%" >nul 2>&1
                exit /b 0
            '''
        }
        success {
            echo "Build #${env.BUILD_NUMBER} passed."
        }
        failure {
            echo "Build #${env.BUILD_NUMBER} failed: ${env.BUILD_URL}console"
        }
    }
}
