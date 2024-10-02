import { Handle, Node, Position } from '@xyflow/react'
import React from 'react'
import { BaseLayout } from './base'

export const TableNode = (node: any) => {
  return (
    <div className='relative'>
      <BaseLayout {...{ node }}>
        <div className='relative w-full'>
          <div className='flex  w-full  '>
            
          </div>
        </div>
      </BaseLayout>
      <Handle type='source' position={Position.Right} id='a' isConnectable />
      <Handle type='target' position={Position.Left} id='a' isConnectable />
    </div>
  )
}

