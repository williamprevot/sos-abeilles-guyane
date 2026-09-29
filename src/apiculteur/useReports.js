import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { fetchReports } from './api.js';

/* Tous les signalements, tenus à jour en direct (Supabase Realtime) :
   un nouveau dépôt sur le site apparaît aussitôt, sans recharger la page. */
export function useReports({ onNewReport } = {}){
  const [reports, setReports] = useState(null);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);
  const onNewRef = useRef(onNewReport);
  onNewRef.current = onNewReport;

  const reload = useCallback(async () => {
    try{
      setReports(await fetchReports());
      setError('');
    }catch(e){
      setError(e.message || String(e));
    }
  }, []);

  useEffect(() => {
    reload();
    const channel = supabase.channel('reports-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, (payload) => {
        if(payload.eventType === 'INSERT'){
          setReports((list) => list ? [payload.new, ...list.filter((r) => r.id !== payload.new.id)] : list);
          if(onNewRef.current) onNewRef.current(payload.new);
        }else if(payload.eventType === 'UPDATE'){
          setReports((list) => list ? list.map((r) => (r.id === payload.new.id ? payload.new : r)) : list);
        }else if(payload.eventType === 'DELETE'){
          const id = payload.old && payload.old.id;
          setReports((list) => list ? list.filter((r) => r.id !== id) : list);
        }
      })
      .subscribe((status) => setLive(status === 'SUBSCRIBED'));

    // Retour sur l'onglet (téléphone sorti de veille…) : on resynchronise.
    const onVisible = () => { if(document.visibilityState === 'visible') reload(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(channel);
    };
  }, [reload]);

  /* Mise à jour locale immédiate après une modification faite ici. */
  const replaceReport = useCallback((row) => {
    setReports((list) => list ? list.map((r) => (r.id === row.id ? { ...r, ...row } : r)) : list);
  }, []);
  const removeReport = useCallback((id) => {
    setReports((list) => list ? list.filter((r) => r.id !== id) : list);
  }, []);

  return { reports, error, live, reload, replaceReport, removeReport };
}
