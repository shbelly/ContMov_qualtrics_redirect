import matplotlib.pyplot as plt
from pandas import read_csv
import numpy as np

fname = input('Behavioral CM_data_{sub}.tsv file name?\t').rstrip()

df = read_csv(fname)
ns = df[df['signal'] == 'go']
ss = df[df['signal'] == 'stop']


def to_float(vals):
    return [np.nan if rt == 'nan' else float(rt) for rt in vals]


fig, ax = plt.subplots()

bins = np.linspace(0, 2000, 20)

ax.set_title('reaction times')
ax.hist(to_float(ns['RT']), bins=bins, alpha=0.5, label='go')
ax.hist(to_float(ss['RT']), bins=bins, alpha=0.5, label='stop')
ax.set_ylabel('count')
ax.set_xlabel('time (ms)')
ax.legend()

fig.tight_layout()

fig, (ax0, ax1) = plt.subplots(1, 2)
fig.set_size_inches(10, 5)


def tsv_pos_to_array(pos):
    return [int(p) for p in pos.split('\t')]


def plot_xy_pos(ax, x_pos, y_pos):
    for x, y in zip(x_pos, y_pos):
        if isinstance(x, str) and isinstance(y, str):
            ax.plot(tsv_pos_to_array(x), tsv_pos_to_array(y))
            ax.set_xlabel('x (pixels)')
            ax.set_ylabel('y (pixels)')


plot_xy_pos(ax0, ns['go_pos_x'], ns['go_pos_y'])
ax0.set_title('motion during go cue')

plot_xy_pos(ax1, ns['stop_pos_x'], ns['stop_pos_y'])
ax1.set_title('motion during after cue')

fig.tight_layout()
