import React from 'react';

const AccentBlobs = ({ leftClass = '', rightClass = '' }) => (
  <>
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -left-20 -top-20 w-56 h-56 rounded-full bg-gradient-to-br from-blue-200 to-transparent opacity-70 blur-3xl transform -rotate-12 sm:-left-32 sm:-top-24 sm:w-80 sm:h-80 sm:opacity-60 ${leftClass}`}
    />
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-100 to-transparent opacity-60 blur-3xl transform rotate-12 sm:-right-40 sm:-bottom-24 sm:w-96 sm:h-96 sm:opacity-50 ${rightClass}`}
    />
  </>
);

export default AccentBlobs;
