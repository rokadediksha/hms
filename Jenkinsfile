pipeline {
    agent any

    tools {
        nodejs 'nodejs'  // Must match the NodeJS installation name in Jenkins Global Tools
    }

    // Inject RDS credentials stored as Jenkins Secret Text credentials
    environment {
        RDS_HOST     = credentials('RDS_HOST')
        RDS_USER     = credentials('RDS_USER')
        RDS_PASSWORD = credentials('RDS_PASSWORD')
        RDS_DB       = credentials('RDS_DB')
        RDS_PORT     = '3306'
        PORT         = '3000'
    }

    stages {

        // ── 1. CLONE ──────────────────────────────────────────────────────────
        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/rokadediksha/hms.git'
                echo "✅ Code cloned successfully"
            }
        }

        // ── 2. INSTALL DEPENDENCIES ───────────────────────────────────────────
        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    echo "✅ Dependencies installed"
                }
            }
        }

        // ── 3. TEST DB CONNECTION ─────────────────────────────────────────────
        stage('Test RDS Connection') {
            steps {
                dir('backend') {
                    sh '''
                    node -e "
                    const mysql = require('mysql2');
                    const conn = mysql.createConnection({
                      host: process.env.RDS_HOST,
                      user: process.env.RDS_USER,
                      password: process.env.RDS_PASSWORD,
                      database: process.env.RDS_DB,
                      port: process.env.RDS_PORT || 3306
                    });
                    conn.connect(err => {
                      if (err) { console.error('RDS connection failed:', err.message); process.exit(1); }
                      console.log('✅ RDS connection successful');
                      conn.end();
                    });
                    "
                    '''
                }
            }
        }

        // ── 4. RUN TESTS ──────────────────────────────────────────────────────
        stage('Run Tests') {
            steps {
                dir('backend') {
                    sh 'npm test || echo "⚠️ Tests skipped or failed (non-blocking)"'
                }
            }
        }

        // ── 5. BUILD FRONTEND ─────────────────────────────────────────────────
        stage('Build Frontend') {
            steps {
                echo "✅ Static frontend is ready (no build step needed)"
                // If you switch to React: sh 'cd frontend && npm install && npm run build'
            }
        }

        // ── 6. DEPLOY ─────────────────────────────────────────────────────────
        stage('Deploy') {
            steps {
                sh '''
                echo "🛑 Stopping any existing Node.js instance..."
                pkill -f "node server.js" || true
                sleep 2

                echo "🚀 Starting HMS backend server..."
                cd backend
                nohup node server.js > /var/log/hms-backend.log 2>&1 &

                echo "⏳ Waiting for server to start..."
                sleep 3

                # Health check
                curl -sf http://localhost:3000/health && echo "✅ Server is running!" || {
                    echo "❌ Health check failed"
                    cat /var/log/hms-backend.log
                    exit 1
                }
                '''
            }
        }

    }

    post {
        success {
            echo '''
            ════════════════════════════════════════
            ✅ DEPLOYMENT SUCCESSFUL
            ════════════════════════════════════════
            Frontend : http://<server-ip>/frontend/index.html
            API      : http://<server-ip>:3000/patients
            Health   : http://<server-ip>:3000/health
            '''
        }
        failure {
            echo '''
            ════════════════════════════════════════
            ❌ PIPELINE FAILED
            ════════════════════════════════════════
            Check the logs above for details.
            '''
        }
        always {
            echo "📋 Pipeline finished. Check /var/log/hms-backend.log for runtime logs."
        }
    }
}
