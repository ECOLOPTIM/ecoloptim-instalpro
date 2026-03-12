import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

const Calendar = () => {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Calendar</h1>
          <p>Planificare lucrări</p>
        </div>
      </div>
      <div className="empty-state">
        <CalendarIcon size={48} />
        <p>Pagină în dezvoltare...</p>
      </div>
    </div>
  );
};

export default Calendar;