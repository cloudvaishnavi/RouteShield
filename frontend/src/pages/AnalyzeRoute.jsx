import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import RouteInput from '../components/analysis/RouteInput';
import ProcessingState from '../components/analysis/ProcessingState';
import ErrorState from '../components/common/ErrorState';
import { usePrediction } from '../hooks/usePrediction';

export default function AnalyzeRoute() {
  const navigate = useNavigate();
  const { loading, step, error, runAnalysis, reset } = usePrediction();

  const handleFormSubmit = async (formData, routeResult) => {
    try {
      const responseData = await runAnalysis(formData);
      // Wait brief moment for user to see completed step before navigating
      setTimeout(() => {
        navigate('/results', {
          state: {
            resultData: responseData,
            inputData: formData,
            routeResult: routeResult,
          },
        });
      }, 500);
    } catch (err) {
      console.error('Submission error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analyze Route Corridor"
        subtitle="Configure shipment parameters and execute XGBoost risk telemetry & multi-agent route optimization."
      />

      {error ? (
        <ErrorState
          title="Analysis Failed"
          message={error}
          onRetry={reset}
        />
      ) : loading || step !== 'idle' ? (
        <ProcessingState currentStep={step} />
      ) : (
        <RouteInput onSubmit={handleFormSubmit} loading={loading} />
      )}
    </div>
  );
}
