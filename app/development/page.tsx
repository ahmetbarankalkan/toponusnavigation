'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function DevelopmentPage() {
  const router = useRouter();

  return (
    <>
      <style jsx global>{`
        body {
          font-family: sans-serif;
          background-color: #050505;
          color: #e0e0e0;
          margin: 0;
          padding: 0;
        }

        .dev-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          background: radial-gradient(
              circle at 20% 30%,
              rgba(0, 255, 255, 0.05) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 70%,
              rgba(147, 51, 234, 0.05) 0%,
              transparent 50%
            );
        }

        .dev-card {
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid #374151;
          backdrop-filter: blur(16px);
          border-radius: 2rem;
          padding: 3rem 2rem;
          text-align: center;
          max-width: 600px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .dev-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(251, 146, 60, 0.1);
          border: 2px solid rgba(251, 146, 60, 0.3);
        }

        .dev-icon svg {
          width: 40px;
          height: 40px;
          color: #fb923c;
          filter: drop-shadow(0 0 10px rgba(251, 146, 60, 0.6));
        }

        .dev-title {
          font-size: 2rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 1rem;
        }

        .dev-description {
          font-size: 1rem;
          color: #9ca3af;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .dev-button {
          display: inline-block;
          padding: 0.75rem 2rem;
          background: rgba(0, 255, 255, 0.1);
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 2rem;
          font-size: 1rem;
          color: #00ffff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dev-button:hover {
          background: rgba(0, 255, 255, 0.2);
          border-color: rgba(0, 255, 255, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 255, 255, 0.2);
        }

        @media (max-width: 768px) {
          .dev-card {
            padding: 2rem 1.5rem;
          }

          .dev-title {
            font-size: 1.5rem;
          }

          .dev-description {
            font-size: 0.9rem;
          }
        }
      `}</style>

      <div className="dev-container">
        <div className="dev-card">
          <div className="dev-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
              />
            </svg>
          </div>
          <h1 className="dev-title">🚧 Under Development</h1>
          <p className="dev-description">
            This platform is currently under development. We're working hard to
            bring you an amazing experience. Stay tuned for updates!
          </p>
          <button className="dev-button" onClick={() => router.push('/entry')}>
            Back to Home
          </button>
        </div>
      </div>
    </>
  );
}
