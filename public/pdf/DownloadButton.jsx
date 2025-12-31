import React from "react";

function DownloadButton({ fileName, fileUrl }) {
  const handleDownload = () => {
    window.gtag('event', 'download', {
      event_category: 'PDF',
      event_label: fileName
    });

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <button onClick={handleDownload}>
      Download {fileName}
    </button>
  );
}

export default DownloadButton;
