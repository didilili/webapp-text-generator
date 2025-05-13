/**
 * 编辑器基础组件
 * 提供编辑器的基础布局，包括标题栏、复制功能、展开/收起功能等
 */
'use client'
import type { FC } from 'react'
import React, { useCallback, useRef, useState } from 'react'
import copy from 'copy-to-clipboard'
import cn from 'classnames'
import PromptEditorHeightResizeWrap from './prompt-editor-height-resize-wrap'
import ToggleExpandBtn from './toggle-expand-btn'
import useToggleExpend from './use-toggle-expend'
import { Clipboard, ClipboardCheck } from '@/app/components/base/icons/line/files'

type Props = {
  className?: string // 自定义类名
  title: JSX.Element | string // 标题内容
  headerRight?: JSX.Element // 标题栏右侧自定义内容
  children: JSX.Element // 编辑器主体内容
  minHeight?: number // 最小高度，默认120
  value: string // 编辑器内容值
  isFocus: boolean // 是否处于焦点状态
}

const Base: FC<Props> = ({
  className,
  title,
  headerRight,
  children,
  minHeight = 120,
  value,
  isFocus,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  // 使用自定义hook处理展开/收起状态
  const {
    wrapClassName,
    isExpand,
    setIsExpand,
    editorExpandHeight,
  } = useToggleExpend({ ref, hasFooter: false })

  // 计算编辑器内容区域的最小高度
  const editorContentMinHeight = minHeight - 28
  const [editorContentHeight, setEditorContentHeight] = useState(editorContentMinHeight)

  // 复制功能相关状态
  const [isCopied, setIsCopied] = React.useState(false)
  const handleCopy = useCallback(() => {
    copy(value)
    setIsCopied(true)
  }, [value])

  return (
    <div className={cn(wrapClassName)}>
      {/* 编辑器主容器 */}
      <div ref={ref} className={cn(className, isExpand && 'h-full', 'rounded-lg border', isFocus ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-100 overflow-hidden')}>
        {/* 标题栏 */}
        <div className='flex justify-between items-center h-7 pt-1 pl-3 pr-2'>
          <div className='text-xs font-semibold text-gray-700'>{title}</div>
          <div className='flex items-center'>
            {headerRight}
            {/* 复制按钮 */}
            {!isCopied
              ? (
                <Clipboard className='mx-1 w-3.5 h-3.5 text-gray-500 cursor-pointer' onClick={handleCopy} />
              )
              : (
                <ClipboardCheck className='mx-1 w-3.5 h-3.5 text-gray-500' />
              )
            }
            {/* 展开/收起按钮 */}
            <div className='ml-1'>
              <ToggleExpandBtn isExpand={isExpand} onExpandChange={setIsExpand} />
            </div>
          </div>
        </div>
        {/* 可调整高度的内容区域 */}
        <PromptEditorHeightResizeWrap
          height={isExpand ? editorExpandHeight : editorContentHeight}
          minHeight={editorContentMinHeight}
          onHeightChange={setEditorContentHeight}
          hideResize={isExpand}
        >
          <div className='h-full pb-2'>
            {children}
          </div>
        </PromptEditorHeightResizeWrap>
      </div>
    </div>
  )
}
export default React.memo(Base)
