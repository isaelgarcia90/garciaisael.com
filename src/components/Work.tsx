import { useState, useCallback } from "react";
import "./styles/Work.css";
import WorkImage from "./WorkImage";
import { MdArrowBack, MdArrowForward } from "react-icons/md";

const projects = [
  {
    title: "forzeswater.com",
    category: "Water-treatment business website featuring product and service information, downloadable catalogs, FAQs, and customer contact options.",
    // tools: "Initial Version: Lovable, React, TypeScript, Formspree, Namecheap, Vercel, Chatbot, Lead Capture, Catalog Downloads, WhatsApp Integration· Evolving Toward: React, TypeScript, RAG, AI Agents, n8n, Supabase, WhatsApp API, Vercel",
    // Se cambia de un string ("") a un elemento JSX (<> </>)
    tools: 
    <>
      <strong>Evolving Toward:</strong> Multi-Agent Sales & Customer Service Platform.
      <br/>
      Combining LLMs, RAG, specialized AI Agents, and n8n workflows to handle producto inquiries, capture customer requirements, initiate quotation requests, and automate sales follow-ups.
      <br /><br />
      <strong>Initial Version:</strong> Lovable, React, TypeScript, Formspree, Namecheap, Vercel, Chatbot, Lead Capture, Catalog Downloads, WhatsApp Integration.
    </>,
    image: "/images/forzeswater.com.webp",
    link: "https://www.forzeswater.com",
  },
  {
    title: "alanisael.com",
    category: "Fundraising website and mobile app created to support my son's soccer journey.",
    tools: "Lovable, React, TypeScript, Stripe/PayPal Donations, Interactive Penalty Game, Fundraising Tracker, Interactive Storytelling, Multimedia Gallery, Custom Avatar, Audio Effects",
    image: "/images/alanisael.com.webp",
    link: "https://www.alanisael.com",
  },
];

const Work = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating]
  );

  const goToPrev = useCallback(() => {
    const newIndex =
      currentIndex === 0 ? projects.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex =
      currentIndex === projects.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);

  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>

        <div className="carousel-wrapper">
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={goToPrev}
            aria-label="Previous project"
            data-cursor="disable"
          >
            <MdArrowBack />
          </button>
          <button
            className="carousel-arrow carousel-arrow-right"
            onClick={goToNext}
            aria-label="Next project"
            data-cursor="disable"
          >
            <MdArrowForward />
          </button>

          <div className="carousel-track-container">
            <div
              className="carousel-track"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {projects.map((project, index) => (
                <div className="carousel-slide" key={index}>
                  <div className="carousel-content">
                    <div className="carousel-info">
                      <div className="carousel-number">
                        <h3>0{index + 1}</h3>
                      </div>
                      <div className="carousel-details">
                        <h4>{project.title}</h4>
                        <p className="carousel-category">{project.category}</p>
                        <div className="carousel-tools">
                          <span className="tools-label">Stack &amp; Features</span>
                          <p>{project.tools}</p>
                        </div>
                      </div>
                    </div>
                    <div className="carousel-image-wrapper">
                      <WorkImage
                        image={project.image}
                        alt={project.title}
                        link={project.link}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="carousel-dots">
            {projects.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${
                  index === currentIndex ? "carousel-dot-active" : ""
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to project ${index + 1}`}
                data-cursor="disable"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Work;
