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

  const onVote = (choice: 'left' | 'right') => {
    if (!jwtToken || hasVoted) {
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
        setVote(choice);
        setHasVoted(true);
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
      <div className="flex justify-around items-center w-full">
        <button className="text-xl underline text-gray-drkr" onClick={() => onVote('left')}>
          {left_bias}
        </button>
        <p className="capitalize text-lime">
          Likely {left_bias > right_bias ? 'left' : 'right'}
        </p>
        <button className="text-xl underline text-gray-drkr" onClick={() => onVote('right')}>
          {right_bias}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className={`relative w-full`}>
          <h2 className="text-5xl font-extrabold text-gray-drk max-w-sm tracking-tight relative z-10">{title}</h2>
        </div>
        <p className='text-gray-drkr max-w-prose'>
          {description}{" "}
          <a href={url} className='text-lime'>{(new URL(url)).hostname}</a>
        </p>
      </div>
    </div>
  );
}
