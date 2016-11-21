#%%

import json
import os
import skimage.io
import skimage.color
import matplotlib.pyplot as plt
import numpy

background = 0.0
borderVal = 214.0 / 360.0

skaa = '/home/bbales2/7kaa_sprite_reader/'

f = open(skaa + 'processed.json')
pr = json.load(f)
f.close()

allSprites = {}

for cname, char in pr.items():
    char = sorted(char, key = lambda x : (x['action'], x['frame']))
    
    adict = {}
    
    minoy = 0
    minox = 0    
    
    maxoy = 0
    maxox = 0
    
    if cname != 'skeleton':
        continue

    for a in char:
        key = (a['action'], a['direction'])

        #if key[0] != 'm' or key[1] != 'w':
        #    continue
        
        if key not in adict:
            adict[key] = []
            
        adict[key].append(a)
        
        minoy = min(minoy, a['oy'])
        minox = min(minox, a['ox'])
        
        maxoy = max(maxoy, a['oy'])
        maxox = max(maxox, a['ox'])
        
    maxh = 0
    maxw = 0

    imd = {}
    
    for (a, d), frames in adict.items():
        ims = []
        
        for frame in frames:
            im = skimage.io.imread(os.path.join(skaa, 'processed/{0}/{1}.png'.format(cname, frame['ptr'])))
            
            ims.append(im)

        maxh = max(maxh, max([image.shape[0] for image in ims]))
        maxw = max(maxw, max([image.shape[1] for image in ims]))
        
        imd[(a, d)] = ims
    
    sheet = []
    metas = []
    
    w = maxh + (maxoy - minoy)
    h = maxw + (maxox - minox)
        
    for (a, d), frames in adict.items():
        ims = imd[(a, d)]

        meta = { 'id' : a + d, 'number' : len(ims), 'y' : len(sheet) }
        
        processed_images = []
        for j, (image, frame) in enumerate(zip(ims, frames)):
            #meta['frames'].append([j, len(sheet)])
            
            processed = numpy.zeros((h, w, 4))
            
            oi = frame['oy'] - minoy# - image.shape[0] / 2 + 
            oj = frame['ox'] - minox#processed.shape[1] / 2 - image.shape[1] / 2 + 
            oim = oi + image.shape[0]
            ojm = oj + image.shape[1]
            
            if d in ['w', 'sw', 'nw']:
                image = numpy.fliplr(image)
    
            processed[oi : oim, oj : ojm, :3] = image[:oim - oi, :ojm - oj]#numpy.flipud()
            
            hsv = skimage.color.rgb2hsv(processed[:, :, :3])
    
            foreground = numpy.linalg.norm(processed, axis = 2) != 0
            border = numpy.abs(hsv[:, :, 0] - borderVal) < 0.05
            
            processed[foreground] += (0, 0, 0, 255)
            processed[border] = (0, 0, 0, 0)

            processed = processed.astype('uint8')
            
            processed_images.append(processed)
            
        strip = numpy.hstack(processed_images)#numpy.flipud()
        
        sheet.append(strip)
        metas.append(meta)
        
    allSprites[cname] = {
        'path' : 'resources/{0}.png'.format(cname),
        'w' : w,
        'h' : h,
        'anims' : dict([(meta['id'], { 'frames' : meta['number'], 'y' : meta['y'] }) for meta in metas])
    }
    
    maxw = max([image.shape[1] for image in sheet])
    
    for i in range(len(sheet)):
        sheet[i] = numpy.pad(sheet[i], ((0, 0), (0, maxw - sheet[i].shape[1]), (0, 0)), 'constant')
        
    sheet = numpy.vstack(sheet)
    skimage.io.imsave('/home/bbales2/football/resources/{0}.png'.format(cname), sheet)

    plt.imshow(sheet, interpolation = 'NONE')
    plt.gcf().set_size_inches((20, 10))
    plt.show()
    
f = open('/home/bbales2/football/resources/sprites.json', 'w')
json.dump(allSprites, f)
f.close()
    