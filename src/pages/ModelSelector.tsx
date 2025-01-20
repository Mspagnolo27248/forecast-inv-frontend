import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Box, Typography, Autocomplete } from '@mui/material';
import axios from 'axios';
import { useModel } from '../context/ModelContext';

export const ModelSelector: React.FC = () => {
  const [modelId, setModelId] = useState('');
  const [modelIds, setModelIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { loadModel } = useModel();

  useEffect(() => {
    const fetchModelIds = async () => {
      try {
        const response = await axios.get('http://localhost:8001/forecast-model');
        setModelIds(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch model IDs');
        console.error('Error fetching model IDs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchModelIds();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelId) return;

    try {
      await loadModel(modelId);
      navigate(`/editor/${modelId}`);
    } catch (error) {
      console.error('Error loading model:', error);
      setError('Failed to load model');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Forecast Model Editor
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <Autocomplete
            value={modelId}
            onChange={(event, newValue) => setModelId(newValue || '')}
            options={modelIds}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Model ID"
                required
                error={!!error}
                helperText={error}
                sx={{ mb: 2 }}
              />
            )}
            freeSolo
            fullWidth
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={!modelId || loading}
            sx={{ mt: 2 }}
          >
            Load Model
          </Button>
        </Box>
      </Box>
    </Container>
  );
}; 