// Deliberately vulnerable Node app for SDLC security lab.
// DO NOT deploy. Every flaw here is intentional and will be caught by
// SAST (Semgrep), SCA (Trivy), or secrets scanning (Gitleaks).

const express = require('express');
const { exec } = require('child_process');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// ---- HARDCODED SECRETS (Gitleaks will catch these) ---------------------
// Realistic-looking but FAKE. Never put real keys in code.
const AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE';
const AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
const JWT_SECRET = 'supersecret123';

// ---- VULN #1: Command injection (Semgrep will flag exec + user input) --
// /ping?host=8.8.8.8  → works
// /ping?host=8.8.8.8;cat /etc/passwd  → game over
app.get('/ping', (req, res) => {
  const host = req.query.host;
  exec(`ping -c 1 ${host}`, (err, stdout) => {
    if (err) return res.status(500).send(err.message);
    res.send(stdout);
  });
});

// ---- VULN #2: eval on user input (RCE; Semgrep will flag eval) ---------
// /calc?expr=1+1  → 2
// /calc?expr=process.exit(1)  → kills the server
app.get('/calc', (req, res) => {
  const result = eval(req.query.expr);
  res.send(String(result));
});

// ---- VULN #3: Weak JWT — uses hardcoded secret above -------------------
app.get('/token', (req, res) => {
  const token = jwt.sign({ user: req.query.user || 'guest' }, JWT_SECRET);
  res.send(token);
});

// ---- VULN #4: Prototype pollution sink (lodash 4.17.4 has CVEs) --------
// Trivy will flag lodash; this is the code path that exploits it.
app.post('/merge', (req, res) => {
  const target = {};
  _.merge(target, req.body);
  res.json(target);
});

app.listen(3000, () => console.log('Vulnerable app on :3000'));
