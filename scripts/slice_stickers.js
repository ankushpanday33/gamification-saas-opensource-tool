const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('c:/Users/panda/Downloads/Saas/node_modules/ffmpeg-static');

const srcImg = 'C:/Users/panda/.gemini/antigravity/brain/4b8c8769-0d93-4849-87ae-29af771a0409/.user_uploaded/media_1794846251695_042e738a.jpg';
const outDir = 'c:/Users/panda/Downloads/Saas/gamify-saas/public/assets/stickers';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 15 stickers with refined bounding boxes
const stickers = [
  {
    id: 'horror_queen',
    title: 'Horror Queen',
    tagline: 'Fearless Midnight Binger',
    category: 'Entertainment',
    tier: 'rare',
    xp: 250,
    coins: 50,
    trigger: 'Watch 5 horror/late-night titles or active after 11 PM',
    x: 48, y: 32, w: 180, h: 170
  },
  {
    id: 'action_hero',
    title: 'Action Hero',
    tagline: 'High Octane Super Fan',
    category: 'Action & Adventure',
    tier: 'epic',
    xp: 350,
    coins: 75,
    trigger: 'Win 3 rounds in Spin Wheel or Slot Machine',
    x: 236, y: 32, w: 180, h: 170
  },
  {
    id: 'romance_pro',
    title: 'Romance Pro',
    tagline: 'Hopeless Romantic Lover',
    category: 'Social & Romance',
    tier: 'common',
    xp: 150,
    coins: 30,
    trigger: 'Refer 1 friend and complete double-rewards',
    x: 442, y: 32, w: 165, h: 170
  },
  {
    id: 'comedy_king',
    title: 'Comedy King',
    tagline: 'Master of Laughter & Memes',
    category: 'Humor & Fun',
    tier: 'rare',
    xp: 200,
    coins: 45,
    trigger: 'Claim daily reward 3 days in a row',
    x: 630, y: 32, w: 165, h: 170
  },
  {
    id: 'drama_llama',
    title: 'Drama Llama',
    tagline: 'All The Gossip, Zero Regrets',
    category: 'Entertainment',
    tier: 'common',
    xp: 180,
    coins: 35,
    trigger: 'Share any badge to WhatsApp or Twitter',
    x: 800, y: 32, w: 165, h: 170
  },
  {
    id: 'drama_llamaa',
    title: 'Drama Queen Llama',
    tagline: 'Tears, Shades & Maximum Glam',
    category: 'Emotions & Fun',
    tier: 'rare',
    xp: 220,
    coins: 50,
    trigger: 'Complete 10 scratch cards in Zepto widget',
    x: 52, y: 200, w: 168, h: 170
  },
  {
    id: 'binge_watcher',
    title: 'Binge Watcher',
    tagline: 'Just One More Episode Master',
    category: 'Streaks & Milestones',
    tier: 'legendary',
    xp: 500,
    coins: 100,
    trigger: 'Hit a 7-day streak in MyNaksh or Duolingo',
    x: 230, y: 200, w: 195, h: 170
  },
  {
    id: 'sci_fi_geek',
    title: 'Sci-Fi Geek',
    tagline: 'Living in the Year 3000',
    category: 'Tech & Gaming',
    tier: 'epic',
    xp: 400,
    coins: 80,
    trigger: 'Interact with all 9 gamification widgets',
    x: 440, y: 200, w: 165, h: 170
  },
  {
    id: 'thriller_junkie',
    title: 'Thriller Junkie',
    tagline: 'Detective on the Trail',
    category: 'Mystery & Thriller',
    tier: 'rare',
    xp: 280,
    coins: 60,
    trigger: 'Reach Top 10 in the Global Leaderboard',
    x: 630, y: 200, w: 165, h: 170
  },
  {
    id: 'music_buff',
    title: 'Music Buff',
    tagline: 'Rhythms, Beats & Headphones On',
    category: 'Music & Audio',
    tier: 'common',
    xp: 160,
    coins: 30,
    trigger: 'Listen to ambient sounds for 5 minutes',
    x: 802, y: 200, w: 165, h: 170
  },
  {
    id: 'rock_star',
    title: 'Rock Star',
    tagline: 'Shredding Solos & Crowd Surfing',
    category: 'Music & Audio',
    tier: 'legendary',
    xp: 450,
    coins: 90,
    trigger: 'Claim total 1,000 XP in Rewards Studio',
    x: 52, y: 366, w: 168, h: 170
  },
  {
    id: 'kids_zone',
    title: 'Kids Zone',
    tagline: 'Pure Joy & Elephant Hugs',
    category: 'Family & Casual',
    tier: 'common',
    xp: 120,
    coins: 25,
    trigger: 'Complete onboarding walkthrough',
    x: 236, y: 366, w: 170, h: 170
  },
  {
    id: 'wildlife_explorer',
    title: 'Wildlife Explorer',
    tagline: 'King of the Urban Safari',
    category: 'Adventure & Nature',
    tier: 'rare',
    xp: 300,
    coins: 65,
    trigger: 'Unlock 5 different mystery chests',
    x: 430, y: 366, w: 172, h: 170
  },
  {
    id: 'documentary_expert',
    title: 'Documentary Expert',
    tagline: 'Knowledge Hunter & Observer',
    category: 'Learning & Knowledge',
    tier: 'epic',
    xp: 380,
    coins: 75,
    trigger: 'Complete 3 learning quizzes with 100% score',
    x: 615, y: 366, w: 175, h: 170
  },
  {
    id: 'award_winner',
    title: 'Award Winner',
    tagline: 'Golden Trophy Hall of Famer',
    category: 'Grand Achievement',
    tier: 'mythic',
    xp: 1000,
    coins: 250,
    trigger: 'Rank #1 on Leaderboard or collect all 14 stickers',
    x: 800, y: 366, w: 168, h: 170
  }
];

for (const s of stickers) {
  const outFile = path.join(outDir, `${s.id}.png`);
  // Crop + transparent colorkey filter
  const filter = `crop=${s.w}:${s.h}:${s.x}:${s.y},colorkey=0xF9F8F2:0.07:0.02`;
  const res = spawnSync(ffmpeg, [
    '-y',
    '-i', srcImg,
    '-vf', filter,
    outFile
  ], { encoding: 'utf-8' });
  if (res.error) console.error(`Error on ${s.id}:`, res.error);
  else console.log(`✓ Cropped transparent: ${s.id}.png`);
}

fs.writeFileSync(path.join(outDir, 'stickers_manifest.json'), JSON.stringify(stickers, null, 2));
console.log('Successfully exported 15 stickers with transparent die-cut backgrounds & manifest!');

