import React, { useState, useEffect } from 'react';

interface ArticleProps {
  news_id: string;
  left_bias: number;
  right_bias: number;
  title: string;
  description: string;
  url: string;
  coverUrl?: string;
  jwtToken: string | null;
}

export default function Article({
  news_id,
  left_bias,
  right_bias,
  title,
  description,
  url,
  coverUrl,
  jwtToken,
}: ArticleProps) {
  const [vote, setVote] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState<string | null>(null); // To store which side the user has voted for

  const onVote = (choice: 'left' | 'right') => {
    if (!jwtToken || (hasVoted && votedFor === choice)) {
      return;
    }

    fetch(`/api/v1/vote/${news_id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vote: choice,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Voting failed.');
        }
        return response.json();
      })
      .then(() => {
        if (votedFor === choice) {
          setVote(null);
        } else {
          setVote(choice);
        }
        setHasVoted(true);
        setVotedFor(choice);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    if (jwtToken) {
      // Additional actions with jwtToken if needed
    }
  }, [jwtToken]);

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex items-center justify-between">
        <p className="capitalize text-gray-drk">
          Likely{' '}
          <span className={`text-lime font-bold`}>
            {vote || (left_bias > right_bias ? 'left' : 'right')}
          </span>
        </p>

        <div className="flex gap-1">
          {/* Highlight the button that the user voted for */}
          <button
            onClick={() => onVote('right')}
            className={`${
              votedFor === 'right' ? 'bg-lime text-green-drk' : 'bg-transparent text-lime'
            } rounded-l-lg font-bold w-9 py-1 border border-1 border-lime transition hover:bg-lime hover:text-green-drk`}
            disabled={hasVoted}
          >
            {right_bias}
          </button>
          {/* Highlight the button that the user voted for */}
          <button
            onClick={() => onVote('left')}
            className={`${
              votedFor === 'left' ? 'bg-lime text-green-drk' : 'bg-transparent text-lime'
            } rounded-r-lg font-bold w-9 py-1 border border-1 border-lime transition hover:bg-lime hover:text-green-drk`}
            disabled={hasVoted}
          >
            {left_bias}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className={`relative w-full`}>
          <h2 className="text-5xl font-extrabold text-gray-drk max-w-sm tracking-tight relative z-10">
            {title}
          </h2>
        </div>
        <p className="text-gray-drkr max-w-prose">
          {description}{' '}
          <a href={url} className="text-lime">
            {(new URL(url)).hostname}
          </a>
        </p>
      </div>
    </div>
  );
}
