// LinkedIn
document.querySelectorAll(".linkedin-link").forEach(link => {
  link.href =
    `https://www.linkedin.com/in/${SITE_CONFIG.linkedinUsername}/`;
});

document.querySelectorAll(".linkedin-username").forEach(element => {
  element.textContent = SITE_CONFIG.linkedinUsername;
});

// GitHub
document.querySelectorAll(".github-link").forEach(link => {
  link.href =
    `https://github.com/${SITE_CONFIG.githubUsername}/`;
});

document.querySelectorAll(".github-username").forEach(element => {
  element.textContent = SITE_CONFIG.githubUsername;
});