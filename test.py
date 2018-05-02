from __future__ import unicode_literals
from pymongo import MongoClient
import numpy as np
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import matplotlib.pyplot as plt
plt.rcdefaults()
import matplotlib
matplotlib.style.use('ggplot')
import pandas as pd
client=MongoClient('mongodb://localhost:60000')
db=client.mydb1
p=db.customers.find()
res=pd.DataFrame(list(p))
sample_review=res.loc[res["BrandName"]=="CNPGD","Review"]


sentiment = SentimentIntensityAnalyzer()
li=["battery","screen","display","camera","accessories","delivery","design","quality","storage","memory","ram","software","weight","bluetooth"]
li1=[0]*14
for sentences in sample_review:
    ss = sentiment.polarity_scores(sentences)
    '''for k in sorted(ss):
        print('{0}: {1}, '.format(k, ss[k]))
    print(sentences)'''
    if ss['neg']!=0.0:
        for k in range(len(li)):
            if li[k] in sentences:
                li1[k]=li1[k]+1
for k in range(len(li)):
    print("{0} : {1}".format(li[k] , li1[k]))
y_pos=np.arange(len(li))
plt.bar(y_pos,li1,align='center',alpha=0.5)
plt.xticks(y_pos,li)

plt.suptitle("Distribution of Negative Reviews By Features")
plt.xlabel("Features Of Mobile")
plt.ylabel("Negative Review count")
plt.show()
