const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-nhsBlue mb-4">About Kidney Compass</h1>
        <p className="text-gray-700 mb-4">
          Version 0.1 – Bootstrap
        </p>
        <p className="text-gray-700">
          Kidney Compass gives UK clinicians and adult patients a one-screen calculator that converts age + sex + ethnicity + serum-creatinine into an MDRD eGFR value and CKD stage, with the option to save or share the result once accounts are enabled.
          Kidney Compass uses the most clinically relevant information regarding chronic kidney disease. For more information about chronic kidney disease, its stages and treatment options, and why eGFR is calculated, please visit the UK Renal Association at http://www.renal.org. Furthermore, the NHS England CKD care pathway and NICE guideline for chronic kidney disease (NG203) offer relevant insight regarding eGFR.
        </p>
      </div>
    </div>
  );
};

export default AboutPage; 