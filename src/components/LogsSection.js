import React from 'react';

const LogsSection = ({ logs }) => {
  return (
    <div className="logs">
      <h2>Logs de Consultas</h2>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>
            <strong>{log.type}:</strong> {log.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LogsSection;