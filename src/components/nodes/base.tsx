"use client"
import { PropsWithChildren, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { useNodeStore } from '@/store';


interface BaseLayoutProps extends PropsWithChildren {
  node: any;
}

export const BaseLayout = ({ children, node }: BaseLayoutProps) => {
  const { selected } = node;
  const { dispatch, state } = useNodeStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleDrawer = () => {
    if (node.data) {
      dispatch({ type: 'SET_SELECTED_NODE', payload: null });
    }

    if (node.type !== 'start') {
      dispatch({ type: 'SET_DRAWER_OPEN', payload: true });
    }

    dispatch({ type: 'SET_SELECTED_NODE', payload: node });
  };

  return (
    <Card
      className={`flex flex-col rounded-md shadow-md bg-gray-950 text-white min-w-64 max-w-72 relative hover:ring-4 hover:ring-sky-500 ${selected && 'ring-4 ring-sky-500'}`}
      onClick={handleToggleDrawer}
    >
      <CardContent className='pb-0 px-0'>
        <div
          className={cn(
            'flex items-center py-3 border-b gap-8 px-3',
            node.type !== 'start' && 'justify-around'
          )}
        >
          {/* icon */}
          <div className='flex flex-col '>
            <h3 className='text-lg  font-bold'>
              {node?.data?.name}
            </h3>
          </div>
        </div>

        {/* Display all fields */}
        <div className="">
          <h4 className=" font-medium">Fields</h4>
          <ul className=" flex flex-col gap-3 ">
            {node?.data?.fields && Object.entries(node.data.fields).map(([fieldName, fieldType]) => (
              <li key={fieldName} className="text-sm py-3 px-2 bg-gray-800  text-white">
                <strong>{fieldName}:</strong> {String(fieldType)}
              </li>
            ))}
          </ul>
        </div>

        {children && (
          <div className='w-full'>{children}</div>
        )}
      </CardContent>
    </Card>
  );
};