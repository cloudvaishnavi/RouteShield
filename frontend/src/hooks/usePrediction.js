import { useState, useCallback } from 'react';
import { analyzeRoute } from '../services/predictionApi';
import { saveAnalysisToHistory } from '../utils/storage';

export function usePrediction() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('idle'); // idle, validating, agent_disruption, agent_route, agent_decision, completed, error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runAnalysis = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setStep('validating');

    try {
      // Intentional UI progression steps to showcase agent workflow
      await new Promise(r => setTimeout(r, 400));
      setStep('agent_disruption');

      await new Promise(r => setTimeout(r, 600));
      setStep('agent_route');

      await new Promise(r => setTimeout(r, 600));
      setStep('agent_decision');

      const responseData = await analyzeRoute(formData);

      await new Promise(r => setTimeout(r, 400));
      setStep('completed');
      setResult(responseData);

      // Save to history
      const savedItem = {
        origin: formData.Origin_Port,
        destination: formData.Destination_Port,
        mode: formData.Transport_Mode,
        product: formData.Product_Category,
        riskScore: responseData?.prediction?.risk_score || 0.5,
        riskLevel: responseData?.prediction?.risk_level || 'MEDIUM',
        decision: responseData?.recommendation?.action || 'STAY',
        recommendedRoute: responseData?.recommendation?.recommended_route?.name || `${formData.Origin_Port} → ${formData.Destination_Port}`,
        inputData: formData,
        apiResult: responseData,
      };
      saveAnalysisToHistory(savedItem);

      return responseData;
    } catch (err) {
      console.error('Analysis execution failed:', err);
      setStep('error');
      setError(err.message || 'Failed to complete disruption analysis.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setStep('idle');
    setResult(null);
    setError(null);
  }, []);

  return {
    loading,
    step,
    result,
    error,
    runAnalysis,
    reset,
  };
}
