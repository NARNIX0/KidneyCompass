import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-nhsBlue mb-6" aria-level={1}>
          Kidney Compass
        </h1>
        <p className="text-gray-700 mb-6">
          Calculate eGFR and CKD stage for UK clinicians and patients.
        </p>
        <div className="flex justify-center">
          <Link 
            to="/calculator"
            className="bg-compassGreen text-white px-6 py-2 rounded hover:bg-opacity-90 transition-colors"
          >
            Calculate
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 