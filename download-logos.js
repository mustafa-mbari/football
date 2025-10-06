const https = require('https');
const fs = require('fs');
const path = require('path');

const logos = {
  'premier-league': {
    'aston-villa': 'https://resources.premierleague.com/premierleague/badges/rb/t7.svg',
    'burnley': 'https://resources.premierleague.com/premierleague/badges/rb/t90.svg',
  },
  'la-liga': {
    'atletico-madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/93.png',
    'rayo-vallecano': 'https://a.espncdn.com/i/teamlogos/soccer/500/95.png',
    'alaves': 'https://a.espncdn.com/i/teamlogos/soccer/500/93.png',
    'mallorca': 'https://a.espncdn.com/i/teamlogos/soccer/500/94.png',
    'levante': 'https://a.espncdn.com/i/teamlogos/soccer/500/96.png',
    'girona': 'https://a.espncdn.com/i/teamlogos/soccer/500/9572.png',
    'real-oviedo': 'https://a.espncdn.com/i/teamlogos/soccer/500/2932.png',
    'elche': 'https://a.espncdn.com/i/teamlogos/soccer/500/2922.png',
    'osasuna': 'https://a.espncdn.com/i/teamlogos/soccer/500/89.png',
    'getafe': 'https://a.espncdn.com/i/teamlogos/soccer/500/3747.png',
    'espanyol': 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
    'villarreal': 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png',
  },
  'bundesliga': {
    'hamburg': 'https://a.espncdn.com/i/teamlogos/soccer/500/167.png',
    'heidenheim': 'https://a.espncdn.com/i/teamlogos/soccer/500/23256.png',
    'st-pauli': 'https://a.espncdn.com/i/teamlogos/soccer/500/170.png',
    'gladbach': 'https://a.espncdn.com/i/teamlogos/soccer/500/163.png',
    'bayern': 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
    'hoffenheim': 'https://a.espncdn.com/i/teamlogos/soccer/500/4331.png',
    'augsburg': 'https://a.espncdn.com/i/teamlogos/soccer/500/4240.png',
    'koln': 'https://a.espncdn.com/i/teamlogos/soccer/500/161.png',
    'frankfurt': 'https://a.espncdn.com/i/teamlogos/soccer/500/162.png',
    'freiburg': 'https://a.espncdn.com/i/teamlogos/soccer/500/176.png',
    'bremen': 'https://a.espncdn.com/i/teamlogos/soccer/500/174.png',
  }
};

function downloadLogo(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadLogo(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }

      const file = fs.createWriteStream(filepath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${path.basename(filepath)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (const [league, teams] of Object.entries(logos)) {
    console.log(`\n📥 Downloading ${league} logos...`);
    for (const [team, url] of Object.entries(teams)) {
      const ext = url.endsWith('.png') ? 'png' : 'svg';
      const filepath = path.join(__dirname, 'frontend', 'public', 'logos', league, `${team}.${ext}`);
      try {
        await downloadLogo(url, filepath);
      } catch (err) {
        console.error(`❌ Failed to download ${team}: ${err.message}`);
      }
    }
  }
  console.log('\n✅ All logos downloaded!');
}

main();
