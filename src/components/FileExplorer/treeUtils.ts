import { FileItem } from '../../types/index.ts';

export interface TreeNode {
  id: string;
  name: string;
  path: string;
  isDir: boolean;
  size?: number;
  item?: FileItem;
  children: TreeNode[];
}

export function buildTree(items: FileItem[], rootPrefix = ''): TreeNode[] {
  const root: { [key: string]: any } = {};

  const cleanPrefix = rootPrefix ? rootPrefix.replace(/^\/+|\/+$/g, '') : '';

  for (const item of items) {
    let p = item.path;
    // Strip rootPrefix if present
    if (cleanPrefix && p.startsWith(cleanPrefix + '/')) {
      p = p.slice(cleanPrefix.length + 1);
    } else if (cleanPrefix && p === cleanPrefix) {
      p = item.name;
    }

    const parts = p.split('/').filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const isDir = !isLast || item.type === 'dir';

      if (!current[part]) {
        current[part] = {
          _meta: {
            id: item.path + (isDir && !isLast ? `__dir_${i}` : ''),
            name: part,
            path: parts.slice(0, i + 1).join('/'),
            fullRepoPath: cleanPrefix ? `${cleanPrefix}/${parts.slice(0, i + 1).join('/')}` : parts.slice(0, i + 1).join('/'),
            isDir,
            size: !isDir ? item.size : undefined,
            item: !isDir ? item : undefined,
          },
          _children: {},
        };
      }

      current = current[part]._children;
    }
  }

  function convert(nodeObj: any): TreeNode[] {
    const result: TreeNode[] = [];
    const keys = Object.keys(nodeObj);

    for (const key of keys) {
      const meta = nodeObj[key]._meta;
      const children = convert(nodeObj[key]._children);

      // If a folder node doesn't have an item yet, create one
      result.push({
        id: meta.id,
        name: meta.name,
        path: meta.fullRepoPath || meta.path,
        isDir: meta.isDir,
        size: meta.size,
        item: meta.item,
        children: children.sort((a, b) => {
          if (a.isDir && !b.isDir) return -1;
          if (!a.isDir && b.isDir) return 1;
          return a.name.localeCompare(b.name);
        }),
      });
    }

    return result.sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  return convert(root);
}

/**
 * Collect all leaf files under a tree node
 */
export function getAllFilesInNode(node: TreeNode): FileItem[] {
  const result: FileItem[] = [];

  function traverse(n: TreeNode) {
    if (!n.isDir && n.item) {
      result.push(n.item);
    }
    for (const child of n.children) {
      traverse(child);
    }
  }

  traverse(node);
  return result;
}

/**
 * Filter tree nodes by a search query
 */
export function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  if (!query.trim()) return nodes;
  const q = query.toLowerCase();

  function filterNode(node: TreeNode): TreeNode | null {
    if (!node.isDir) {
      if (node.name.toLowerCase().includes(q) || node.path.toLowerCase().includes(q)) {
        return node;
      }
      return null;
    }

    const filteredChildren = node.children
      .map(filterNode)
      .filter((n): n is TreeNode => n !== null);

    if (filteredChildren.length > 0 || node.name.toLowerCase().includes(q)) {
      return {
        ...node,
        children: filteredChildren,
      };
    }

    return null;
  }

  return nodes.map(filterNode).filter((n): n is TreeNode => n !== null);
}
