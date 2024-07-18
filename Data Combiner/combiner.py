import os

def fix(data: list):
    fixed = data[0]
    for i in range(1, len(data)):
        line = [data[i][0]+data[i][1]]
        line.extend(data[i][2:])
        fixed.append(line)

    return fixed

def extract(data: list):
    extracted = []
    start = False
    for i in range(1, len(data)):
        if start or "1990" in data[i][0] or "1991" in data[i][0]:
            start = True
            for j in range(1, len(data[i])):
                if data[i][j] != '':
                    # print(data[i])
                    extracted.append((int(data[i][0].split(" ")[2][:-1]), float(data[i][j].replace('"', ''))))
    return extracted

def clip(data: list, build: int):
    start = build - 15
    end = 2023

    return [x for x in data if x[0] >= start and x[0] <= end]


dataFiles = [[y.split(",") for y in open('./data/'+x).read().replace('"1,', '"1').split("\n")] for x in os.listdir('./data')] # read from all files in the data folder
dates = [int(''.join(filter(lambda x: x.isdigit(), x.replace("B2", '').replace("B3", '')))) for x in os.listdir('./data')] # cursed list comprehension

# print(dataFiles[0])
dataFiles = [fix(x[:-1]) for x in dataFiles] # fix the data

extracts = [extract(x) for x in dataFiles] # extract the data

clips = [clip(x, dates[i]) for i, x in enumerate(extracts)] # clip the data

maxLen = max([len(x) for x in clips])

averages = [0 for x in range(maxLen)]
combined = [[] for x in range(maxLen)]

print(dates)

for i in range(maxLen):
    total = 0
    count = 0
    for x in clips:
        if i < len(x):
            combined[i].append(x[i][1])
            total += x[i][1]
            count += 1
    averages[i] = total/count

with open("output.txt", 'w') as f:
    for i in range(maxLen):
        f.write(f'{-15+i},{str(round(averages[i], 3))},{",".join([str(round(x, 3)) for x in combined[i]])}\n')
    # f.write(', '.join([str(round(x, 3)) for x in averages])) # write the averages to the output file