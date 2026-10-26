import { useEffect, useRef } from "react";
import "./styles/WhatIDo.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const WhatIDo = () => {
  const containerRef = useRef<(HTMLDivElement | null)[]>([]);
  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };
  useEffect(() => {
    if (ScrollTrigger.isTouch) {
      containerRef.current.forEach((container) => {
        if (container) {
          container.classList.remove("what-noTouch");
          container.addEventListener("click", () => handleClick(container));
        }
      });
    }
    return () => {
      containerRef.current.forEach((container) => {
        if (container) {
          container.removeEventListener("click", () => handleClick(container));
        }
      });
    };
  }, []);
  return (
    <div className="whatIDO">
      <div className="what-box">
        <h2 className="title">
          W<span className="hat-h2">HAT</span>
          <div>
            I<span className="do-h2"> DO</span>
          </div>
        </h2>
      </div>
      <div className="what-box">
        <div className="what-box-in">
          <div className="what-border2">
            <svg width="100%">
              <line x1="0" y1="0" x2="0" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="7,7" />
              <line x1="100%" y1="0" x2="100%" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="7,7" />
            </svg>
          </div>

          {/* Panel 1 — Software Engineering */}
          <div className="what-content what-noTouch" ref={(el) => setRef(el, 0)}>
            <div className="what-border1">
              <svg height="100%">
                <line x1="0" y1="0" x2="100%" y2="0" stroke="white" strokeWidth="2" strokeDasharray="6,6" />
                <line x1="0" y1="100%" x2="100%" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="6,6" />
              </svg>
            </div>
            <div className="what-corner"></div>
            <div className="what-content-in">
              <h3>SOFTWARE ENGINEERING</h3>
              <h4>End-to-End Software Delivery</h4>
              <p>
                I help teams design, integrate, test, troubleshoot, and improve software systems across
                the development lifecycle.
              </p>
              <h5>Skillset</h5>
              <div className="what-content-flex">
                <div className="what-tags">Python</div>
                <div className="what-tags">C</div>
                <div className="what-tags">C++</div>
                <div className="what-tags">Linux</div>
                <div className="what-tags">Bash/Shell</div>
                <div className="what-tags">APIs</div>                
                <div className="what-tags">Git/GitHub</div>
                <div className="what-tags">Automation</div>
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>

          {/* Panel 2 — Artificial Intelligence */}
          <div className="what-content what-noTouch" ref={(el) => setRef(el, 1)}>
            <div className="what-border1">
              <svg height="100%">
                <line x1="0" y1="100%" x2="100%" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="6,6" />
              </svg>
            </div>
            <div className="what-corner"></div>
            <div className="what-content-in">
              <h3>ARTIFICIAL INTELLIGENCE</h3>
              <h4>Applied AI &amp; Automation</h4>
              <p>
                I build practical AI-powered automation solutions for customer service,
                sales, workflows, and business operations.
              </p>
              <h5>Skillset</h5>
              <div className="what-content-flex">
                <div className="what-tags">LLMs</div>
                <div className="what-tags">RAG</div>
                <div className="what-tags">AI Agents</div>
                <div className="what-tags">Multi-Agent Systems</div>
                <div className="what-tags">MCP</div>                
                <div className="what-tags">n8n</div>
                <div className="what-tags">Supabase</div>
                <div className="what-tags">FastAPI</div>
                <div className="what-tags">REST APIs</div>
                <div className="what-tags">AWS</div>
                <div className="what-tags">GCP</div>
                <div className="what-tags">Azure</div>
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WhatIDo;

function handleClick(container: HTMLDivElement) {
  container.classList.toggle("what-content-active");
  container.classList.remove("what-sibling");
  if (container.parentElement) {
    const siblings = Array.from(container.parentElement.children);
    siblings.forEach((sibling) => {
      if (sibling !== container) {
        sibling.classList.remove("what-content-active");
        sibling.classList.toggle("what-sibling");
      }
    });
  }
}
