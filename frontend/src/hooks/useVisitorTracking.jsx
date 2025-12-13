// src/hooks/useVisitorTracking.js
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';

export const useVisitorTracking = () => {
  const location = useLocation();
  const [liveCount, setLiveCount] = useState(0);
  const [visitorStats, setVisitorStats] = useState({
    visitorsToday: 0,
    visitorsThisMonth: 0,
    totalVisitors: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const sessionIdRef = useRef(null);

  useEffect(() => {
    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem('visitor_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('visitor_session_id', sessionId);
    }
    sessionIdRef.current = sessionId;

    // Initialize socket connection
    const socketInstance = io('https://aadibgmg.onrender.com', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      
      // Send visitor join event with current page
      socketInstance.emit('visitorJoin', {
        sessionId: sessionIdRef.current,
        page: location.pathname
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Listen for live count updates
    socketInstance.on('liveCountUpdate', (data) => {
      console.log('Live count updated:', data.liveViewers);
      setLiveCount(data.liveViewers);
    });

    socketRef.current = socketInstance;

    // Fetch all visitor stats
    const fetchAllStats = async () => {
      try {
        const response = await fetch('https://aadibgmg.onrender.com/api/visitors/stats/all');
        if (response.ok) {
          const data = await response.json();
          setVisitorStats({
            visitorsToday: data.visitorsToday || 0,
            visitorsThisMonth: data.visitorsThisMonth || 0,
            totalVisitors: data.totalVisitors || 0
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchAllStats();

    // Refresh stats every 5 minutes
    const statsInterval = setInterval(fetchAllStats, 5 * 60 * 1000);

    // Send heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('activityUpdate', {
          sessionId: sessionIdRef.current,
          page: location.pathname
        });
      }
    }, 30000);

    // Cleanup
    return () => {
      clearInterval(statsInterval);
      clearInterval(heartbeatInterval);
      
      if (socketRef.current) {
        socketRef.current.emit('visitorLeave');
        socketRef.current.disconnect();
      }
    };
  }, []); // Empty dependency array - only run once on mount

  // Update page location when route changes
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && sessionIdRef.current) {
      socketRef.current.emit('activityUpdate', {
        sessionId: sessionIdRef.current,
        page: location.pathname
      });
    }
  }, [location.pathname]);

  return {
    liveCount,
    visitorStats,
    isConnected,
    socket: socketRef.current
  };
};