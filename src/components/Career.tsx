import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>          
          Experience
        </h2>
        <div className="career-info">

          {/* Independent AI Engineer */}
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Independent AI Engineer</h4>
                <h5>Applied AI · AI Agents · Business Automation · Cloud</h5>
              </div>
              <h4>NOW</h4>
            </div>
            <p>
            Building AI-powered software and business automation solutions using LLMs, RAG,
            AI agents, multi-agent architectures, workflow automation, and cloud technologies.
            </p>
          </div>

          {/* Senior SW Engineer - Capgemini */}
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Senior SW Engineer</h4>
                <h5>Capgemini - Automotive</h5>
              </div>
              <h5>2019–2025</h5>
            </div>
            <p>
              Worked on automotive software projects covering development, integration,
              testing, debugging, and technical coordination using C/C++, Python, and Linux.
            </p>
          </div>

          {/* SW Engineer - Toshiba */}
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>SW Engineer</h4>
                <h5>Toshiba - Retail</h5>
              </div>
              <h5>2018–2019</h5>
            </div>
            <p>
              Worked on Linux-based retail and POS platforms, integrating Java and Python packages,
              customizing kiosk applications, and supporting deployment, validation, and troubleshooting.
            </p>
          </div>

          {/* SW Engineer - Continental */}
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>SW Engineer</h4>
                <h5>Continental (Aumovio) - Automotive</h5>
              </div>
              <h5>2015–2018</h5>
            </div>
            <p>
              Developed and maintained automotive software components and APIs, supporting integration,
              validation, releases, and technical documentation.
            </p>
          </div>

          {/* Network Engineer - Ericsson */}
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Network Engineer</h4>
                <h5>Ericsson - Telecom</h5>
              </div>
              <h5>2013–2015</h5>
            </div>
            <p>
              Automated KPI analysis and reporting for large-scale telecommunications networks
              using Python and Excel/VBA, reducing manual processing through automation.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Career;
