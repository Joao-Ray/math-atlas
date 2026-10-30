import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from '@tarojs/components';
import { mathAssets } from '../generated/math-assets';

export default function MathFormula({ latex }: { latex: string }) {
  const asset = mathAssets[latex];
  const [error, setError] = useState(false), [retry, setRetry] = useState(0);
  useEffect(() => { setError(false); }, [latex]);
  return <View className='math-panel'>
    {asset && !error ? <ScrollView scrollX className='math-scroll'>
      <Image key={latex + retry} src={asset.src} mode='scaleToFill' ariaLabel={latex}
        style={{ width: asset.width * 2 + 'rpx', height: asset.height * 2 + 'rpx' }} onError={() => setError(true)} />
    </ScrollView> : <View>
      <Text className='math-source' selectable>{latex}</Text>
      <Text className='muted small'>{error ? '公式图片加载失败，上方保留原始 LaTeX。' : '公式图片未生成，上方为原始 LaTeX。'}</Text>
      {error && asset ? <Text className='link small' onClick={() => { setError(false); setRetry((value) => value + 1); }}>重新加载</Text> : null}
    </View>}
    {asset && !error && asset.width > 260 ? <Text className='muted tiny'>长公式可左右滑动 ↔</Text> : null}
  </View>;
}
