import React, { useState, useEffect } from 'react';

interface ArticleProps {
  news_id: string;
  left_bias: number;
  right_bias: number;
  title: string;
  description: string;
  url: string;
  jwtToken: string | null;
}

export default function Article({
  news_id,
  left_bias,
  right_bias,
  title,
  description,
  url,
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
    <div className="flex flex-col gap-3">
      <div className="flex justify-between w-full">
        <button className="text-lg underline" onClick={() => onVote('left')}>
          {left_bias}
        </button>
        <p className="capitalize">
          Likely {left_bias > right_bias ? 'left' : 'right'}
        </p>
        <button className="text-lg underline" onClick={() => onVote('right')}>
          {right_bias}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-3xl">{title}</h2>
        <p>
          {description}
          <a href={url}>Source</a>
        </p>
      </div>
    </div>
  );
}
