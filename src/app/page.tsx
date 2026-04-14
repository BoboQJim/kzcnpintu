'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Trophy, 
  Clock, 
  Star, 
  Coins, 
  Gift, 
  RotateCcw, 
  Shuffle, 
  Eye,
  Volume2,
  VolumeX,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// 难度配置
const DIFFICULTIES = {
  easy: { rows: 4, cols: 6, name: '简单', blocks: 24 },
  medium: { rows: 6, cols: 8, name: '中等', blocks: 48 },
  hard: { rows: 10, cols: 15, name: '困难', blocks: 150 }
};

// 省份数据
const PROVINCES = [
  { id: 'beijing', name: '北京', landmarks: ['Forbidden City', 'Temple of Heaven', 'Great Wall'] },
  { id: 'shanghai', name: '上海', landmarks: ['Oriental Pearl', 'The Bund'] },
  { id: 'jiangsu', name: '江苏', landmarks: ['Suzhou Garden', 'Sun Yat-sen Mausoleum'] },
  { id: 'zhejiang', name: '浙江', landmarks: ['West Lake', 'Wuzhen'] },
  { id: 'anhui', name: '安徽', landmarks: ['Yellow Mountain', 'Hongcun Village'] },
  { id: 'fujian', name: '福建', landmarks: ['Wuyi Mountains', 'Gulangyu Island'] },
  { id: 'jiangxi', name: '江西', landmarks: ['Lushan Mountain', 'Tengwang Pavilion'] },
  { id: 'shandong', name: '山东', landmarks: ['Mount Tai', 'Baotu Spring'] },
  { id: 'guangdong', name: '广东', landmarks: ['Canton Tower', 'Danxia Mountain'] },
  { id: 'guangxi', name: '广西', landmarks: ['Guilin Landscape', 'Yangshuo Street'] },
  { id: 'hainan', name: '海南', landmarks: ['Tianya Haijiao', 'Yalong Bay'] },
  { id: 'sichuan', name: '四川', landmarks: ['Jiuzhaigou', 'Leshan Giant Buddha'] },
  { id: 'guizhou', name: '贵州', landmarks: ['Huangguoshu Waterfall', 'Xijiang Miao Village'] },
  { id: 'yunnan', name: '云南', landmarks: ['Lijiang Old Town', 'Stone Forest'] },
  { id: 'xizang', name: '西藏', landmarks: ['Potala Palace', 'Namtso Lake'] },
  { id: 'shaanxi', name: '陕西', landmarks: ['Terracotta Army', 'Mount Hua'] },
  { id: 'gansu', name: '甘肃', landmarks: ['Mogao Caves', 'Jiayuguan Fort'] },
  { id: 'qinghai', name: '青海', landmarks: ['Qinghai Lake', 'Kumbum Monastery'] },
  { id: 'ningxia', name: '宁夏', landmarks: ['Shapatou', 'Western Xia Tombs'] },
  { id: 'xinjiang', name: '新疆', landmarks: ['Tianshan Mountains', 'Kanas Lake'] },
  { id: 'hongkong', name: '香港', landmarks: ['Victoria Harbour', 'Victoria Peak'] },
  { id: 'aomen', name: '澳门', landmarks: ['Ruins of St Paul', 'Macau Tower'] },
  { id: 'taiwan', name: '台湾', landmarks: ['Taipei 101', 'Sun Moon Lake'] },
  { id: 'tianjin', name: '天津', landmarks: ['Tianjin Eye', 'Ancient Culture Street'] },
  { id: 'hebei', name: '河北', landmarks: ['Mountain Resort', 'Shanhaiguan'] },
  { id: 'shanxi', name: '山西', landmarks: ['Pingyao Ancient City', 'Yungang Grottoes'] },
  { id: 'neimenggu', name: '内蒙古', landmarks: ['Grassland', 'Mongolian Yurt'] },
  { id: 'liaoning', name: '辽宁', landmarks: ['Shenyang Palace', 'Golden Pebble Beach'] },
  { id: 'jilin', name: '吉林', landmarks: ['Changbai Mountain', 'Songhua River'] },
  { id: 'heilongjiang', name: '黑龙江', landmarks: ['Ice and Snow World', 'Central Street'] },
  { id: 'hubei', name: '湖北', landmarks: ['Yellow Crane Tower', 'Three Gorges'] },
  { id: 'hunan', name: '湖南', landmarks: ['Yueyang Tower', 'Zhangjiajie'] },
  { id: 'chongqing', name: '重庆', landmarks: ['Hongya Cave', 'Jiefangbei'] }
];

type Difficulty = 'easy' | 'medium' | 'hard';

interface GameState {
  province: string;
  provinceName: string;
  landmark: string;
  imageUrl: string;
  difficulty: Difficulty;
  tiles: number[];
  emptyIndex: number;
  moves: number;
  time: number;
  isComplete: boolean;
  isPaused: boolean;
}

interface GameStats {
  totalGames: number;
  completedGames: number;
  bestTime: Record<string, number>;
  coins: number;
}

export default function PuzzleGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stats, setStats] = useState<GameStats>({
    totalGames: 0,
    completedGames: 0,
    bestTime: {},
    coins: 100
  });
  const [currentProvinceIndex, setCurrentProvinceIndex] = useState(0);


  // 加载统计
  useEffect(() => {
    const saved = localStorage.getItem('puzzleStats');
    if (saved) {
      setStats(JSON.parse(saved));
    }
  }, []);

  // 保存统计
  const saveStats = useCallback((newStats: GameStats) => {
    localStorage.setItem('puzzleStats', JSON.stringify(newStats));
    setStats(newStats);
  }, []);

  // 生成图片URL
  const getImageUrl = useCallback(async (province: string, landmark: string): Promise<string> => {
    try {
      const response = await fetch('/api/landmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ province, name: landmark })
      });
      const data = await response.json();
      if (data.imageUrl) {
        return data.imageUrl;
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
    
    // 备用：使用占位图
    return `https://picsum.photos/seed/${province}-${landmark}/600/400`;
  }, []);

  // 初始化游戏
  const initGame = useCallback(async (difficulty: Difficulty = 'easy') => {
    const province = PROVINCES[currentProvinceIndex];
    const landmarkIndex = Math.floor(Math.random() * province.landmarks.length);
    const landmark = province.landmarks[landmarkIndex];
    
    const config = DIFFICULTIES[difficulty];
    const totalBlocks = config.blocks;
    
    // 创建正确顺序的tiles
    let tiles = Array.from({ length: totalBlocks - 1 }, (_, i) => i + 1);
    tiles.push(0); // 0表示空位
    
    setImageLoading(true);
    
    try {
      const imageUrl = await getImageUrl(province.id, landmark);
      
      setGameState({
        province: province.id,
        provinceName: province.name,
        landmark,
        imageUrl,
        difficulty,
        tiles,
        emptyIndex: totalBlocks - 1,
        moves: 0,
        time: 0,
        isComplete: false,
        isPaused: false
      });
    } finally {
      setImageLoading(false);
    }
  }, [currentProvinceIndex, getImageUrl]);

  // 洗牌
  const shuffleTiles = useCallback(() => {
    if (!gameState) return;
    
    let tiles = [...gameState.tiles];
    const emptyIndex = tiles.indexOf(0);
    
    // 随机交换
    for (let i = 0; i < 100; i++) {
      const neighbors = getNeighbors(emptyIndex, DIFFICULTIES[gameState.difficulty].cols, DIFFICULTIES[gameState.difficulty].rows);
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      [tiles[emptyIndex], tiles[randomNeighbor]] = [tiles[randomNeighbor], tiles[emptyIndex]];
    }
    
    const newEmptyIndex = tiles.indexOf(0);
    
    setGameState(prev => prev ? {
      ...prev,
      tiles,
      emptyIndex: newEmptyIndex,
      moves: 0,
      time: 0,
      isComplete: false
    } : null);
  }, [gameState]);

  // 获取相邻格子
  const getNeighbors = (index: number, cols: number, rows: number): number[] => {
    const neighbors: number[] = [];
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    if (col > 0) neighbors.push(index - 1);
    if (col < cols - 1) neighbors.push(index + 1);
    if (row > 0) neighbors.push(index - cols);
    if (row < rows - 1) neighbors.push(index + cols);
    
    return neighbors;
  };

  // 移动格子
  const moveTile = useCallback((index: number) => {
    if (!gameState || gameState.isComplete) return;
    
    const { emptyIndex, tiles, difficulty } = gameState;
    const config = DIFFICULTIES[difficulty];
    const neighbors = getNeighbors(emptyIndex, config.cols, config.rows);
    
    if (!neighbors.includes(index)) return;
    
    const newTiles = [...tiles];
    [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
    
    const isComplete = checkWin(newTiles);
    
    if (isComplete) {
      const newStats = {
        ...stats,
        completedGames: stats.completedGames + 1,
        coins: stats.coins + 10,
        bestTime: {
          ...stats.bestTime,
          [`${gameState.province}_${gameState.difficulty}`]: 
            Math.min(
              stats.bestTime[`${gameState.province}_${gameState.difficulty}`] || Infinity,
              gameState.time
            )
        }
      };
      saveStats(newStats);
    }
    
    setGameState(prev => prev ? {
      ...prev,
      tiles: newTiles,
      emptyIndex: index,
      moves: prev.moves + 1,
      isComplete
    } : null);
  }, [gameState, stats, saveStats]);

  // 检查是否完成
  const checkWin = (tiles: number[]): boolean => {
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== i + 1) return false;
    }
    return tiles[tiles.length - 1] === 0;
  };

  // 计时器
  useEffect(() => {
    if (!gameState || gameState.isComplete || gameState.isPaused) return;
    
    const timer = setInterval(() => {
      setGameState(prev => prev ? { ...prev, time: prev.time + 1 } : null);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState?.isComplete, gameState?.isPaused]);

  // 预加载相邻省份图片 - 使用 useRef 追踪已加载
  const loadedProvinces = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    const indicesToPreload = [
      (currentProvinceIndex - 1 + PROVINCES.length) % PROVINCES.length,
      currentProvinceIndex,
      (currentProvinceIndex + 1) % PROVINCES.length
    ];
    
    for (const idx of indicesToPreload) {
      const province = PROVINCES[idx];
      for (const landmark of province.landmarks) {
        const key = `${province.id}_${landmark}`;
        if (!loadedProvinces.current.has(key)) {
          loadedProvinces.current.add(key);
          // 使用 fetch 直接预加载，不等待结果
          fetch('/api/landmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ province: province.id, name: landmark })
          }).catch(() => {}); // 静默忽略错误
        }
      }
    }
  }, [currentProvinceIndex]);

  // 切换省份
  const changeProvince = (direction: number) => {
    setCurrentProvinceIndex(prev => {
      const newIndex = (prev + direction + PROVINCES.length) % PROVINCES.length;
      return newIndex;
    });
  };

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 计算拼图块尺寸
  const getBlockStyle = (difficulty: Difficulty) => {
    const config = DIFFICULTIES[difficulty];
    return {
      width: `calc(${100 / config.cols}% - 2px)`,
      height: `calc(${100 / config.rows}% - 2px)`
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* 顶部导航 */}
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            华夏拼图
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-700/50 rounded-full px-3 py-1">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium">{stats.coins}</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 省份选择 */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => changeProvince(-1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-2 px-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {PROVINCES[currentProvinceIndex].name}
                </Badge>
                <span className="text-slate-400 text-sm">
                  {currentProvinceIndex + 1} / {PROVINCES.length}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => changeProvince(1)}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* 难度选择 */}
        <div className="flex justify-center mb-6">
          <Tabs 
            value={gameState?.difficulty || 'easy'} 
            onValueChange={(v) => initGame(v as Difficulty)}
            className="w-fit"
          >
            <TabsList className="bg-slate-800/50">
              <TabsTrigger value="easy">简单</TabsTrigger>
              <TabsTrigger value="medium">中等</TabsTrigger>
              <TabsTrigger value="hard">困难</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 游戏区域 */}
        <div className="max-w-4xl mx-auto">
          {/* 游戏状态栏 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-4 py-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="font-mono">{formatTime(gameState?.time || 0)}</span>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-4 py-2">
                <Shuffle className="w-5 h-5 text-purple-400" />
                <span className="font-mono">{gameState?.moves || 0} 步</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPreview(true)}
                disabled={!gameState}
              >
                <Eye className="w-4 h-4 mr-2" />
                预览
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={shuffleTiles}
                disabled={!gameState || imageLoading}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                重新开始
              </Button>
            </div>
          </div>

          {/* 进度条 */}
          {gameState && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-400 mb-1">
                <span>完成进度</span>
                <span>{Math.round((gameState.tiles.filter((t, i) => t === i + 1 || (i === gameState.tiles.length - 1 && t === 0)).length / gameState.tiles.length) * 100)}%</span>
              </div>
              <Progress 
                value={(gameState.tiles.filter((t, i) => t === i + 1 || (i === gameState.tiles.length - 1 && t === 0)).length / gameState.tiles.length) * 100} 
                className="h-2"
              />
            </div>
          )}

          {/* 拼图板 */}
          <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <CardContent className="p-4">
              {imageLoading || !gameState ? (
                <div className="aspect-[4/3] flex items-center justify-center bg-slate-900/50 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400">加载中...</p>
                  </div>
                </div>
              ) : (
                <div 
                  className="grid gap-1 bg-slate-900 rounded-lg p-1"
                  style={{
                    gridTemplateColumns: `repeat(${DIFFICULTIES[gameState.difficulty].cols}, 1fr)`,
                    gridTemplateRows: `repeat(${DIFFICULTIES[gameState.difficulty].rows}, 1fr)`
                  }}
                >
                  {gameState.tiles.map((tile, index) => {
                    const config = DIFFICULTIES[gameState.difficulty];
                    const blockWidth = 100 / config.cols;
                    const blockHeight = 100 / config.rows;
                    
                    if (tile === 0) {
                      return (
                        <div 
                          key={index}
                          className="bg-slate-800 rounded"
                          style={{ aspectRatio: '1' }}
                        />
                      );
                    }
                    
                    const originalIndex = tile - 1;
                    const originalRow = Math.floor(originalIndex / config.cols);
                    const originalCol = originalIndex % config.cols;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => moveTile(index)}
                        className="relative overflow-hidden rounded transition-transform active:scale-95 hover:ring-2 hover:ring-amber-500/50"
                        style={{ aspectRatio: '1' }}
                      >
                        <div 
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url(${gameState.imageUrl})`,
                            backgroundSize: `${config.cols * 100}% ${config.rows * 100}%`,
                            backgroundPosition: `${originalCol * blockWidth}% ${originalRow * blockHeight}%`
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 景点信息 */}
          {gameState && (
            <div className="mt-4 text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {gameState.landmark}
              </Badge>
            </div>
          )}
        </div>

        {/* 统计信息 */}
        <div className="max-w-4xl mx-auto mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-400" />
              <p className="text-2xl font-bold">{stats.completedGames}</p>
              <p className="text-sm text-slate-400">已完成</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-2xl font-bold">{stats.totalGames}</p>
              <p className="text-sm text-slate-400">总游戏数</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-4 text-center">
              <Gift className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p className="text-2xl font-bold">{stats.coins}</p>
              <p className="text-sm text-slate-400">金币</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <p className="text-2xl font-bold">
                {Object.values(stats.bestTime).length > 0 
                  ? formatTime(Math.min(...Object.values(stats.bestTime)))
                  : '--:--'}
              </p>
              <p className="text-sm text-slate-400">最佳时间</p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 图片预览弹窗 */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle>完整图片预览</DialogTitle>
            <DialogDescription>
              {gameState?.provinceName} - {gameState?.landmark}
            </DialogDescription>
          </DialogHeader>
          {gameState?.imageUrl && (
            <img 
              src={gameState.imageUrl} 
              alt={gameState.landmark}
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 设置弹窗 */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle>设置</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span>音效</span>
              <Button 
                variant={soundEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? '开启' : '关闭'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <span>重置游戏数据</span>
              <Button 
                variant="destructive"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('puzzleStats');
                  setStats({
                    totalGames: 0,
                    completedGames: 0,
                    bestTime: {},
                    coins: 100
                  });
                  setShowSettings(false);
                }}
              >
                重置
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 胜利弹窗 */}
      <Dialog open={gameState?.isComplete} onOpenChange={() => {}}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">恭喜通关!</DialogTitle>
            <DialogDescription className="text-center">
              你已完成 {gameState?.provinceName} {gameState?.landmark} 的拼图!
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex justify-around text-center">
              <div>
                <p className="text-3xl font-bold text-amber-400">{gameState?.moves}</p>
                <p className="text-sm text-slate-400">步数</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-400">{formatTime(gameState?.time || 0)}</p>
                <p className="text-sm text-slate-400">用时</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-2 text-amber-400">
              <Coins className="w-5 h-5" />
              <span>+10 金币</span>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => changeProvince(1)}
            >
              下一省份
            </Button>
            <Button 
              className="flex-1"
              onClick={() => {
                shuffleTiles();
              }}
            >
              再玩一次
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
