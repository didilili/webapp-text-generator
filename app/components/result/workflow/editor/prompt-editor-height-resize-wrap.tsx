/**
 * 可调整高度的编辑器包装组件
 * 该组件提供了一个可拖拽调整高度的容器，用于包装编辑器内容
 */
'use client'
import React, { useCallback, useEffect, useState } from 'react'
import type { FC } from 'react'
import { useDebounceFn } from 'ahooks'
import cn from 'classnames'

type Props = {
  className?: string // 自定义类名
  height: number // 当前高度
  minHeight: number // 最小高度限制
  onHeightChange: (height: number) => void // 高度变化回调函数
  children: JSX.Element // 子组件内容
  footer?: JSX.Element // 底部可选内容
  hideResize?: boolean // 是否隐藏调整手柄
}

const PromptEditorHeightResizeWrap: FC<Props> = ({
  className,
  height,
  minHeight,
  onHeightChange,
  children,
  footer,
  hideResize,
}) => {
  // 记录鼠标位置和调整状态
  const [clientY, setClientY] = useState(0)
  const [isResizing, setIsResizing] = useState(false)
  // 保存原始的用户选择样式，用于调整结束后恢复
  const [prevUserSelectStyle, setPrevUserSelectStyle] = useState(getComputedStyle(document.body).userSelect)

  // 开始调整高度时的处理函数
  const handleStartResize = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setClientY(e.clientY)
    setIsResizing(true)
    setPrevUserSelectStyle(getComputedStyle(document.body).userSelect)
    document.body.style.userSelect = 'none' // 防止拖拽时选中文本
  }, [])

  // 停止调整高度时的处理函数
  const handleStopResize = useCallback(() => {
    setIsResizing(false)
    document.body.style.userSelect = prevUserSelectStyle // 恢复原始选择样式
  }, [prevUserSelectStyle])

  // 使用防抖处理高度调整，避免频繁更新
  const { run: didHandleResize } = useDebounceFn((e) => {
    if (!isResizing)
      return

    const offset = e.clientY - clientY
    let newHeight = height + offset
    setClientY(e.clientY)
    if (newHeight < minHeight)
      newHeight = minHeight
    onHeightChange(newHeight)
  }, {
    wait: 0,
  })

  const handleResize = useCallback(didHandleResize, [isResizing, height, minHeight, clientY])

  // 监听鼠标移动事件
  useEffect(() => {
    document.addEventListener('mousemove', handleResize)
    return () => {
      document.removeEventListener('mousemove', handleResize)
    }
  }, [handleResize])

  // 监听鼠标释放事件
  useEffect(() => {
    document.addEventListener('mouseup', handleStopResize)
    return () => {
      document.removeEventListener('mouseup', handleStopResize)
    }
  }, [handleStopResize])

  return (
    <div className='relative'>
      {/* 主要内容区域 */}
      <div className={cn(className, 'overflow-y-auto')}
        style={{
          height,
        }}
      >
        {children}
      </div>
      {/* 底部内容 */}
      {footer}
      {/* 高度调整手柄 */}
      {!hideResize && (
        <div
          className='absolute bottom-0 left-0 w-full flex justify-center h-2 cursor-row-resize'
          onMouseDown={handleStartResize}>
          <div className='w-5 h-[3px] rounded-sm bg-gray-300'></div>
        </div>
      )}
    </div>
  )
}
export default React.memo(PromptEditorHeightResizeWrap)
