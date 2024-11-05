import matplotlib.pyplot as plt
import matplotlib.patches as patches

fix_size = 30
dpi = 300

fig, ax = plt.subplots(figsize=(800 / dpi, 600 / dpi), dpi=dpi)
fig.subplots_adjust(left=0, right=1, top=1, bottom=0)
ax.axis('off')
ax.set_xlim([0, 1])
ax.set_ylim([0, 1])
ax.text(0.5, 0.5, '+', fontsize='xx-large', ha='center', va='center')
fig.savefig('images/fix.png')

rect = patches.Rectangle((1 - 6 / 8 * fix_size / dpi, 0),
                         6 / 8 * fix_size / dpi, fix_size / dpi,
                         facecolor='black')
ax.add_patch(rect)
fig.savefig('images/fix_pd.png')
