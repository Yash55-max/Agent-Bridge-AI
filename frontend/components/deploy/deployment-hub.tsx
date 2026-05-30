"use client";

const dockerfile = `FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`;

const requirements = `fastapi>=0.115.0
uvicorn[standard]
pydantic-settings`;

const cloudRun = `gcloud run deploy agentbridge-mcp \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated`;

const ibmCloud = `ibmcloud ce application create \
  --name agentbridge-mcp \
  --source . \
  --port 8000`;

function SnippetCard({ title, body }: { title: string; body: string }) {
  async function copy() {
    await navigator.clipboard.writeText(body);
  }

  return (
    <article className="deploy-card">
      <div className="deploy-card-head">
        <h4>{title}</h4>
        <button className="snippet-button" type="button" onClick={copy}>
          Copy
        </button>
      </div>
      <pre className="deploy-snippet">{body}</pre>
    </article>
  );
}

export function DeploymentHub() {
  return (
    <main className="deployment-shell">
      <header className="deployment-hero">
        <p className="section-label">Deployment Hub</p>
        <h1>Go live with one clean handoff</h1>
        <p>
          Copy production-ready container files, then paste the cloud command into your platform of choice.
        </p>
      </header>

      <section className="deploy-grid">
        <SnippetCard title="Dockerfile" body={dockerfile} />
        <SnippetCard title="requirements.txt" body={requirements} />
      </section>

      <section className="cloud-guides">
        <article className="deploy-card">
          <div className="deploy-card-head">
            <h4>Google Cloud Run</h4>
            <button className="snippet-button" type="button" onClick={async () => navigator.clipboard.writeText(cloudRun)}>
              Copy
            </button>
          </div>
          <pre className="deploy-snippet">{cloudRun}</pre>
        </article>

        <article className="deploy-card">
          <div className="deploy-card-head">
            <h4>IBM Cloud Code Engine</h4>
            <button className="snippet-button" type="button" onClick={async () => navigator.clipboard.writeText(ibmCloud)}>
              Copy
            </button>
          </div>
          <pre className="deploy-snippet">{ibmCloud}</pre>
        </article>
      </section>

      <a className="primary-cta inline-cta" href="/workspace">
        Back to Dashboard
      </a>
    </main>
  );
}
