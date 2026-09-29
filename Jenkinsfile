// Core Collective — CI pipeline (Jenkins Declarative)
//
// Mirrors .github/workflows/ci.yml minus the registry push:
//   web     → Next.js 14  : npm ci → test → build
//   backend → NestJS 11   : npm ci → build → test
//   docker  → validates both Dockerfiles compile (no push)
//
// Assumptions:
//   * Linux agent with Node.js >= 22, npm and Docker (Buildx) installed
//   * The .env files are git-ignored, so no secrets are needed to build:
//     NEXT_PUBLIC_* are inlined at build time and every consumer tolerates
//     them being unset (src/lib/supabase.js returns null server-side).
//
// NOTE ON ESCAPING: sh '''...''' is a Groovy GString, so Groovy interpolates
// `$name` before the shell ever sees it. Shell-local variables must be written
// as \$name; only ${env.BUILD_NUMBER} (below) is meant to be interpolated.
//
// First run checklist:
//   1. Create a Pipeline job pointing at this repo (multibranch or Pipeline
//      script from SCM).
//   2. Make sure the agent label used below actually has node + docker.

pipeline {
    agent any

    parameters {
        booleanParam(
            name: 'RUN_LINT',
            defaultValue: false,
            description: 'Run eslint on the Next.js app. Off by default: lint is not part of the GitHub Actions gate, and `npm run lint` in backend/ rewrites files (eslint --fix).'
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
        // Both Dockerfiles use `RUN --mount=type=cache`, which only works with
        // BuildKit. Docker >= 23 has it on by default; this is belt and braces.
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
                sh '''
                    set -eu

                    for bin in git node npm docker; do
                        if ! command -v "\$bin" >/dev/null 2>&1; then
                            echo "::error::\$bin is not installed on $(hostname) - fix the agent or use a different label"
                            exit 1
                        fi
                    done

                    # NestJS 11 + @supabase/realtime-js need native WebSocket, i.e. Node 22+.
                    node_major=$(node -p process.versions.node | cut -d. -f1)
                    if [ "\$node_major" -lt 22 ]; then
                        echo "::error::Node $(node -v) found, Node 22+ required"
                        exit 1
                    fi
                    echo "node $(node -v) / npm $(npm -v)"

                    if docker buildx version >/dev/null 2>&1; then
                        echo "buildx: $(docker buildx version)"
                    else
                        echo "::warning::docker buildx not found - falling back to legacy docker build"
                    fi

                    # `npm ci` needs the lockfiles, and fails with a confusing
                    # error if they were never committed.
                    for lock in package-lock.json backend/package-lock.json; do
                        [ -f "\$lock" ] || { echo "::error::\$lock is missing"; exit 1; }
                    done
                '''
            }
        }

        stage('CI') {
            parallel {
                stage('Web (Next.js)') {
                    steps {
                        sh '''
                            set -eu
                            npm ci
                            npm test
                            npm run build
                        '''
                    }
                }

                stage('Backend (NestJS)') {
                    steps {
                        dir('backend') {
                            sh '''
                                set -eu
                                npm ci
                                npm run build
                                npm test
                            '''
                        }
                    }
                }

                stage('Lint') {
                    when { expression { params.RUN_LINT } }
                    steps {
                        sh 'set -eu; npm run lint'
                    }
                }
            }
        }

        stage('Docker build') {
            steps {
                sh '''
                    set -eu

                    # Label both images with the build number so the post{}
                    # cleanup can prune exactly what this run produced and
                    # never touch images from other jobs.
                    LABEL="jenkins.core-collective.build=${env.BUILD_NUMBER}"

                    if docker buildx version >/dev/null 2>&1; then
                        docker buildx build --load --label "\$LABEL" \\
                            -t "core-collective-backend:build-${env.BUILD_NUMBER}" \\
                            -f backend/Dockerfile ./backend
                        docker buildx build --load --label "\$LABEL" \\
                            -t "core-collective-web:build-${env.BUILD_NUMBER}" \\
                            -f Dockerfile .
                    else
                        docker build --label "\$LABEL" \\
                            -t "core-collective-backend:build-${env.BUILD_NUMBER}" \\
                            -f backend/Dockerfile ./backend
                        docker build --label "\$LABEL" \\
                            -t "core-collective-web:build-${env.BUILD_NUMBER}" \\
                            -f Dockerfile .
                    fi

                    docker image ls --filter "label=\$LABEL"
                '''
            }
        }
    }

    post {
        always {
            // Single-quoted Groovy string, so ${BUILD_NUMBER} reaches the shell as-is.
            sh 'docker image prune -f --filter "label=jenkins.core-collective.build=${BUILD_NUMBER}" || true'
        }
        success {
            echo "Build #${env.BUILD_NUMBER} passed."
        }
        failure {
            echo "Build #${env.BUILD_NUMBER} failed: ${env.BUILD_URL}console"
        }
    }
}
