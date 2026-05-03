import { useState, useCallback } from 'react';
import { settlementApi } from '../api/settlementApi';

export function useSettlement(contractId) {
  const [settlement,     setSettlement]     = useState(null);
  const [geofenceEvents, setGeofenceEvents] = useState([]);
  const [fuelReadings,   setFuelReadings]   = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);

  const fetchSettlement = useCallback(async () => {
    if (!contractId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await settlementApi.getSettlement(contractId);
      setSettlement(res.data.settlement);
      setGeofenceEvents(res.data.geofenceEvents || []);
      setFuelReadings(res.data.fuelReadings || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  const runCalculation = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await settlementApi.calculate(payload);
      setSettlement(res.data.settlement);
      // 계산 직후 상세 데이터 재조회
      await fetchSettlement();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [fetchSettlement]);

  const confirmSettlement = useCallback(async (confirmedBy, note) => {
    setLoading(true);
    try {
      const res = await settlementApi.confirm(contractId, { confirmedBy, note });
      setSettlement(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  return {
    settlement, geofenceEvents, fuelReadings,
    loading, error,
    fetchSettlement, runCalculation, confirmSettlement,
  };
}
