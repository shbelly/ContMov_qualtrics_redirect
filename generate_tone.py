import numpy as np
from scipy.io import wavfile

samplerate = 44100
fs = 400
t = np.linspace(0., 0.25, int(samplerate * 0.25))
amplitude = np.iinfo(np.int16).max
data = amplitude * np.sin(2. * np.pi * fs * t)
wavfile.write('./tone.wav', samplerate, data)