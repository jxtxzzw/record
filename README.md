# record

> 打卡求监督，我们可以一起成就更好的自己

## Build Setup

``` bash
# install dependencies
$ npm run install

# rename .env-sample to .env
mv .env-sample .env

# set environment variables
vim .env

# initialize the database
npm run init-db

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

一个基于 Vue + nuxt.JS 的刷题打卡系统，建议配合另一个仓库 coding 一起使用。

项目的初衷是与好友在准备实习笔试的过程中，需要进行编程训练，为了相互督促，避免咕咕咕，就编写了这个项目。

系统包含了 LeetCode 所有的题目，并提供主要功能有：

1. 刷题打卡，同时可以记录每一题的数据结构、算法、刷题笔记（例如需要注意的点）以及代码分享。

2. 打卡情况统计，包括连续打卡天数、打卡热力图、累积刷题数。

3. 重点题目可以加入星标，反复回顾。

4. 全文搜索，不只是题目标题，还有所有用户的笔记和代码。可以看到所有人踩过的坑、可以发现更多优秀的思路，共同提高。

5. 竞争，可以和小伙伴一决雌雄，看看谁坚持刷题更久。

6. 排名，看一眼别的小伙伴都刷了多少题了、坚持了多少天了，给自己一种紧迫感、危机感，为了避免找实习的时候被别人比下去，就好好努力吧。

项目已部署在 https://record.jxtxzzw.com，希望这个小小的虚荣心能够帮助你我共同成就更好的自己。相信这个系统可以帮助到准备考研复试机考、准备实习的你们。建议搭配我的另一个仓库（coding）以获得更好体验。

同时，对于想要熟悉 Web 设计、JavaScript、前后端交互、Vue.js、 Nuxt.js、数据库管理（ORM）的用户，这也是一个不错的仓库，非常适合初学者提升自己的项目经历。

A record system based on Vue + nuxt.js, it is recommended to use with my other repo: "coding".

The original intention of the project is to prepare for the internship with friends. We need to conduct programming training, and in order to supervise each other, we wrote this project.

The system contains all the problems of LeetCode and provides the main functions as follows:

1. Record. You can write down the data structure, algorithm, notes (such as points needing attention) and code of each problem.

2. Statistics, including days of continuous recording, heat map and cumulative number of coding.

3. Star marks can be added to key topics for repeated review.

4. Full-text search, not just the title, but all the user's notes and code. We can see the points where everyone has stepped, and we can find more excellent ideas to improve together.

5. Compete. You can fight it out with your friends to see who sticks around longer.

6. Ranking, by taking a look at how many problems other partners have completed, and how many days do they insist, give yourself a sense of urgency, in order to compete for an better internship.

Project has been deployed in https://record.jxtxzzw.com, I hope this little vanity can help you achieve better yourself. I believe that this system can help to prepare for the graduate examination, or prepare for the internship. I suggest working with my other repository ("coding") for a better experience.

At the same time, for users who want to be familiar with Web design, JavaScript, front-end interaction, vue.js, nuxt.js, database management (ORM), it is also a good repository for beginners to improve their project experience.

