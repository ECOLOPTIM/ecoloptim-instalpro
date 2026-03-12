import React from 'react';
import { FileText } from 'lucide-react';

const Documente = () => {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Documente</h1>
          <p>Gestionează documentele</p>
        </div>
      </div>
      <div className="empty-state">
        <FileText size={48} />
        <p>Pagină în dezvoltare...</p>
      </div>
    </div>
  );
};

export default Documente;