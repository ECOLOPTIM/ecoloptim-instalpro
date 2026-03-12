import React from 'react';
import { Receipt } from 'lucide-react';

const Facturi = () => {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Facturi</h1>
          <p>Gestionează facturile</p>
        </div>
      </div>
      <div className="empty-state">
        <Receipt size={48} />
        <p>Pagină în dezvoltare...</p>
      </div>
    </div>
  );
};

export default Facturi;