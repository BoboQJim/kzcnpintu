import { ImageGenerationClient, Config } from 'coze-coding-dev-sdk';

const config = new Config();
const imageClient = new ImageGenerationClient(config);

// 中国各省景点数据
const LANDMARKS = [
  { province: 'beijing', name: 'Forbidden City', prompt: 'Photorealistic view of Forbidden City in Beijing with red walls and golden roofs, clear blue sky, majestic imperial palace architecture' },
  { province: 'beijing', name: 'Temple of Heaven', prompt: 'Photorealistic Temple of Heaven in Beijing, circular altar with blue roof, red pillars, clear sky' },
  { province: 'beijing', name: 'Great Wall', prompt: 'Photorealistic Great Wall of China winding through mountains, brick wall with watchtowers' },
  { province: 'shanghai', name: 'Oriental Pearl', prompt: 'Photorealistic Oriental Pearl Tower in Shanghai at night, illuminated with colorful lights' },
  { province: 'shanghai', name: 'The Bund', prompt: 'Photorealistic view of The Bund Shanghai colonial buildings at sunset, Huangpu River' },
  { province: 'jiangsu', name: 'Suzhou Garden', prompt: 'Photorealistic classical Suzhou garden with lotus pond, traditional Chinese pavilions' },
  { province: 'jiangsu', name: 'Sun Yat-sen Mausoleum', prompt: 'Photorealistic Sun Yat-sen Mausoleum on Purple Mountain Nanjing, white marble architecture' },
  { province: 'zhejiang', name: 'West Lake', prompt: 'Photorealistic West Lake Hangzhou, traditional pavilions, willow trees, lotus flowers' },
  { province: 'zhejiang', name: 'Wuzhen', prompt: 'Photorealistic Wuzhen ancient water town, wooden boats on canal, stone bridges, red lanterns' },
  { province: 'anhui', name: 'Yellow Mountain', prompt: 'Photorealistic Yellow Mountain Huangshan with granite peaks, odd-shaped pines, clouds' },
  { province: 'anhui', name: 'Hongcun Village', prompt: 'Photorealistic Hongcun Village in Anhui, traditional architecture, moon-shaped pond' },
  { province: 'fujian', name: 'Wuyi Mountains', prompt: 'Photorealistic Wuyi Mountains, Danxia landscape, green peaks, misty valleys' },
  { province: 'fujian', name: 'Gulangyu Island', prompt: 'Photorealistic Gulangyu Island in Xiamen, colonial architecture, tropical trees' },
  { province: 'jiangxi', name: 'Lushan Mountain', prompt: 'Photorealistic Lushan Mountain, dramatic clouds and mist, waterfalls' },
  { province: 'jiangxi', name: 'Tengwang Pavilion', prompt: 'Photorealistic Tengwang Pavilion in Nanchang, traditional Chinese pavilion' },
  { province: 'shandong', name: 'Mount Tai', prompt: 'Photorealistic Mount Tai, sacred Taoist mountain with temples, stone steps' },
  { province: 'shandong', name: 'Baotu Spring', prompt: 'Photorealistic Baotu Spring in Jinan, famous spring with pavilions, lotus pond' },
  { province: 'guangdong', name: 'Canton Tower', prompt: 'Photorealistic Canton Tower Guangzhou, iconic TV tower with colorful lights' },
  { province: 'guangdong', name: 'Danxia Mountain', prompt: 'Photorealistic Danxia Mountain, colorful landform, red sandstone peaks' },
  { province: 'guangxi', name: 'Guilin Landscape', prompt: 'Photorealistic Guilin Karst landscape, limestone mountains, Li River' },
  { province: 'guangxi', name: 'Yangshuo Street', prompt: 'Photorealistic Yangshuo, ancient street, karst landscape, red lanterns' },
  { province: 'hainan', name: 'Tianya Haijiao', prompt: 'Photorealistic Tianyahaijiao in Sanya, rock formation on tropical beach, palm trees' },
  { province: 'hainan', name: 'Yalong Bay', prompt: 'Photorealistic Yalong Bay in Sanya, tropical beach, clear blue water' },
  { province: 'sichuan', name: 'Jiuzhaigou', prompt: 'Photorealistic Jiuzhaigou Valley, colorful lakes, turquoise water, mountains' },
  { province: 'sichuan', name: 'Leshan Giant Buddha', prompt: 'Photorealistic Leshan Giant Buddha, massive Buddha carved into cliff' },
  { province: 'guizhou', name: 'Huangguoshu Waterfall', prompt: 'Photorealistic Huangguoshu Waterfall, spectacular waterfall, karst cliffs' },
  { province: 'guizhou', name: 'Xijiang Miao Village', prompt: 'Photorealistic Xijiang Miao Village, stilted houses, terraced rice fields' },
  { province: 'yunnan', name: 'Lijiang Old Town', prompt: 'Photorealistic Lijiang Old Town, Naxi architecture, cobblestone streets' },
  { province: 'yunnan', name: 'Stone Forest', prompt: 'Photorealistic Stone Forest, karst limestone pillars, unique formations' },
  { province: 'xizang', name: 'Potala Palace', prompt: 'Photorealistic Potala Palace in Lhasa, white and red palace, Tibetan architecture' },
  { province: 'xizang', name: 'Namtso Lake', prompt: 'Photorealistic Namtso Lake, turquoise water, snow mountains' },
  { province: 'shaanxi', name: 'Terracotta Army', prompt: 'Photorealistic Terracotta Army in Xian, ancient warriors' },
  { province: 'shaanxi', name: 'Mount Hua', prompt: 'Photorealistic Mount Hua, steep cliffs, narrow plank walks' },
  { province: 'gansu', name: 'Mogao Caves', prompt: 'Photorealistic Mogao Caves in Dunhuang, ancient Buddhist cave temples' },
  { province: 'gansu', name: 'Jiayuguan Fort', prompt: 'Photorealistic Jiayuguan Fort, ancient Chinese fort, Great Wall' },
  { province: 'qinghai', name: 'Qinghai Lake', prompt: 'Photorealistic Qinghai Lake, vast lake, rapeseed flowers' },
  { province: 'qinghai', name: 'Kumbum Monastery', prompt: 'Photorealistic Kumbum Monastery, Tibetan Buddhist temple, golden roofs' },
  { province: 'ningxia', name: 'Shapatou', prompt: 'Photorealistic Shapotou Desert, Yellow River, desert oasis' },
  { province: 'ningxia', name: 'Western Xia Tombs', prompt: 'Photorealistic Western Xia Royal Tombs, pyramid-shaped mausoleums' },
  { province: 'xinjiang', name: 'Tianshan Mountains', prompt: 'Photorealistic Tianshan Mountains, snow-capped peaks, grassland' },
  { province: 'xinjiang', name: 'Kanas Lake', prompt: 'Photorealistic Kanas Lake, emerald green water, autumn colors' },
  { province: 'hongkong', name: 'Victoria Harbour', prompt: 'Photorealistic Victoria Harbour Hong Kong, neon skyscrapers, harbor' },
  { province: 'hongkong', name: 'Victoria Peak', prompt: 'Photorealistic Victoria Peak Hong Kong, viewing platform, city skyline' },
  { province: 'aomen', name: 'Ruins of St Paul', prompt: 'Photorealistic Ruins of St Paul in Macau, stone facade, Portuguese architecture' },
  { province: 'aomen', name: 'Macau Tower', prompt: 'Photorealistic Macau Tower, observation tower, sunset backdrop' },
  { province: 'taiwan', name: 'Taipei 101', prompt: 'Photorealistic Taipei 101, iconic skyscraper, bamboo-inspired architecture' },
  { province: 'taiwan', name: 'Sun Moon Lake', prompt: 'Photorealistic Sun Moon Lake Taiwan, alpine lake, temple, mountains' },
  { province: 'tianjin', name: 'Tianjin Eye', prompt: 'Photorealistic Tianjin Eye Ferris wheel on Haihe River, sunset' },
  { province: 'tianjin', name: 'Ancient Culture Street', prompt: 'Photorealistic Ancient Culture Street Tianjin, traditional buildings, red lanterns' },
  { province: 'hebei', name: 'Mountain Resort', prompt: 'Photorealistic Mountain Resort Chengde, imperial palace, lake' },
  { province: 'hebei', name: 'Shanhaiguan', prompt: 'Photorealistic Shanhaiguan Pass, ancient fort, Great Wall' },
  { province: 'shanxi', name: 'Pingyao Ancient City', prompt: 'Photorealistic Pingyao Ancient City, Ming dynasty architecture, city walls' },
  { province: 'shanxi', name: 'Yungang Grottoes', prompt: 'Photorealistic Yungang Grottoes, Buddhist cave temples, Buddha statues' },
  { province: 'neimenggu', name: 'Grassland', prompt: 'Photorealistic Inner Mongolia grassland, vast green grassland, yurts' },
  { province: 'neimenggu', name: 'Mongolian Yurt', prompt: 'Photorealistic Mongolian yurt, blue sky, horses grazing' },
  { province: 'liaoning', name: 'Shenyang Palace', prompt: 'Photorealistic Shenyang Imperial Palace, Qing dynasty architecture' },
  { province: 'liaoning', name: 'Golden Pebble Beach', prompt: 'Photorealistic Golden Pebble Beach in Dalian, golden sand, unique rocks' },
  { province: 'jilin', name: 'Changbai Mountain', prompt: 'Photorealistic Changbai Mountain, crater lake Tianchi, forests' },
  { province: 'jilin', name: 'Songhua River', prompt: 'Photorealistic Songhua River in Jilin, frozen river, snow-covered banks' },
  { province: 'heilongjiang', name: 'Ice and Snow World', prompt: 'Photorealistic Ice and Snow World in Harbin, magnificent ice sculptures, colorful lights' },
  { province: 'heilongjiang', name: 'Central Street', prompt: 'Photorealistic Harbin Central Street, European-style architecture, snow' },
  { province: 'hubei', name: 'Yellow Crane Tower', prompt: 'Photorealistic Yellow Crane Tower in Wuhan, traditional Chinese pagoda' },
  { province: 'hubei', name: 'Three Gorges', prompt: 'Photorealistic Three Gorges Dam, massive hydroelectric dam' },
  { province: 'hunan', name: 'Yueyang Tower', prompt: 'Photorealistic Yueyang Tower, famous pavilion overlooking Dongting Lake' },
  { province: 'hunan', name: 'Zhangjiajie', prompt: 'Photorealistic Zhangjiajie, sandstone pillars, Avatar-like landscape' },
  { province: 'chongqing', name: 'Hongya Cave', prompt: 'Photorealistic Hongya Cave Chongqing, stilted buildings, night lights' },
  { province: 'chongqing', name: 'Jiefangbei', prompt: 'Photorealistic Jiefangbei Chongqing, commercial district, neon lights' },
];

// 内存缓存已生成的图片URL
const imageCache: Map<string, string> = new Map();

export async function generateLandmarkImage(province: string, name: string): Promise<string> {
  const cacheKey = `${province}_${name}`;
  
  // 检查缓存
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }
  
  // 查找景点数据
  const landmark = LANDMARKS.find(l => l.province === province && l.name === name);
  if (!landmark) {
    throw new Error(`Landmark not found: ${province}_${name}`);
  }
  
  try {
    // 生成图片
    const response = await imageClient.generate({
      prompt: landmark.prompt + ', high detail, 2K quality',
      size: '2K'
    });
    
    const helper = imageClient.getResponseHelper(response);
    
    if (helper.success && helper.imageUrls.length > 0) {
      const imageUrl = helper.imageUrls[0];
      imageCache.set(cacheKey, imageUrl);
      return imageUrl;
    }
    
    throw new Error('Image generation failed');
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

export function getLandmarks() {
  return LANDMARKS.map(l => ({
    province: l.province,
    name: l.name
  }));
}
