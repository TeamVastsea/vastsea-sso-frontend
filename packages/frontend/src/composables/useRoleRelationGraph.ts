import type { Edge, Node } from '@vue-flow/core';
import { MarkerType, useVueFlow } from '@vue-flow/core';
import { nextTick, ref } from 'vue';
import { useGraphLayout } from './useGraphLayout';
import { useRole } from './useRole';

interface NodeData {
  id: string;
  label: string;
  showExpand: boolean;
}

export function useRoleRelationGraph() {
  const nodes = ref<Node<NodeData>[]>([]);
  const edges = ref<Edge[]>([]);
  const instance = useVueFlow();

  const { getRoleInfo } = useRole();
  const { layout } = useGraphLayout();
  
  const pushNode = (data: NodeData) => {
    if (nodes.value.some(node => node.id === data.id)){return;}
    nodes.value.push({
      id: data.id,
      position: {x:0,y:0},
      type:'custom',
      data:{
        label: data.label,
        id: data.id,
        showExpand: data.showExpand
      }
    })
  }
  const pushEdge = ({source,target}: {source: string, target: string}) => {
    if (edges.value.some(edge => edge.id === `${source} -> ${target}`)){
      return;
    }
    edges.value.push({
      id: `${source} -> ${target}`,
      source,
      target,
      animated: true,
      markerEnd: {
        type: MarkerType.Arrow,
        width: 20,
        height: 20,
        color: 'color-mix(in oklch, var(--colors-blue-500) var(--un-bg-opacity), transparent) /* oklch(0.623 0.214 259.815) */'
      },
      style: {
        'stroke': 'color-mix(in oklch, var(--colors-blue-500) var(--un-bg-opacity), transparent) /* oklch(0.623 0.214 259.815) */'
      }
      // markerStart: MarkerType.Arrow,
    })
  }

  const fetch = (roleId: string) => {
    return new Promise((resolve) => {
    getRoleInfo(roleId)
      .then((roleInfo) => {
        pushNode({label: roleInfo.name, id: roleInfo.id, showExpand: false})
        for (const parent of roleInfo.parents) {
          pushNode({label: parent.name, id: parent.id, showExpand: true});
          if (!instance.findEdge(`${roleInfo.id} -> ${parent.id}`)){
            pushEdge({source: roleInfo.id, target:parent.id})
          }
        }
        nextTick(()=>{
          nodes.value = layout(nodes.value,edges.value,'TB');
          instance.fitView()
          .then(()=>resolve(true))
        })
      });
    })
  };

  const onClickExpand = (id: string) => {
    fetch(id)
    .then(()=>{
      nodes.value = nodes.value.map<Node>((node) => {
        if (node.id !== id){
          return node;
        }
        return {
          ...node,
          data:{
            ...node.data,
            showExpand: false,
          }
        }
      })
      instance.updateNodeData(id, {
        showExpand: false
      })
    })
  };

  return { nodes, edges, fetch, onClickExpand };
}
