import { Octokit } from '@octokit/rest';
import type { RepositoryNode, GitHubContentResponse } from '../types';

/**
 * GitHub service class to handle all GitHub API interactions
 */
class GitHubService {
  private octokit: Octokit;

  constructor() {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    if (!token) {
      console.warn('No GitHub token found. API requests will be rate limited.');
    }
    this.octokit = new Octokit({
      auth: token,
    });
  }

  /**
   * Extracts owner and repo from a GitHub URL
   * @param url GitHub repository URL
   * @returns Object containing owner and repo name
   */
  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL');
    }
    return {
      owner: match[1],
      repo: match[2],
    };
  }

  /**
   * Analyzes file content to find relationships with other files
   */
  private async analyzeFileRelationships(
    content: string,
    filePath: string,
    allFiles: Map<string, RepositoryNode>
  ): Promise<{ type: 'import' | 'dependency' | 'reference' | 'other'; targetId: string; description?: string }[]> {
    const relationships: { type: 'import' | 'dependency' | 'reference' | 'other'; targetId: string; description?: string }[] = [];
    const fileExtension = filePath.split('.').pop()?.toLowerCase();

    // Analyze imports and dependencies based on file type
    if (fileExtension === 'js' || fileExtension === 'ts' || fileExtension === 'jsx' || fileExtension === 'tsx') {
      // Find import statements
      const importRegex = /import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        // Try to find the imported file in our node map
        for (const [id, node] of allFiles.entries()) {
          if (node.path.endsWith(importPath) || node.path.endsWith(`${importPath}.${fileExtension}`)) {
            relationships.push({
              type: 'import',
              targetId: id,
              description: `Imports from ${node.name}`,
            });
          }
        }
      }
    }

    // Add more relationship analysis for other file types here
    // For example, markdown files might reference other files
    if (fileExtension === 'md') {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(content)) !== null) {
        const linkPath = match[2];
        for (const [id, node] of allFiles.entries()) {
          if (node.path.endsWith(linkPath)) {
            relationships.push({
              type: 'reference',
              targetId: id,
              description: `References ${node.name}`,
            });
          }
        }
      }
    }

    return relationships;
  }

  /**
   * Fetches repository contents recursively
   * @param owner Repository owner
   * @param repo Repository name
   * @param path Path to fetch (defaults to root)
   * @returns Promise resolving to repository node structure
   */
  private async fetchContents(
    owner: string,
    repo: string,
    path: string = '',
    allFiles: Map<string, RepositoryNode> = new Map()
  ): Promise<RepositoryNode[]> {
    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      const contents = Array.isArray(response.data)
        ? response.data
        : [response.data];

      const nodes: RepositoryNode[] = await Promise.all(
        contents.map(async (item: GitHubContentResponse) => {
          const node: RepositoryNode = {
            id: item.sha,
            name: item.name,
            type: item.type === 'dir' ? 'directory' : 'file',
            path: item.path,
            size: item.size,
          };

          if (item.type === 'dir') {
            try {
              node.children = await this.fetchContents(owner, repo, item.path, allFiles);
            } catch (error) {
              console.warn(`Failed to fetch contents of ${item.path}:`, error);
              node.children = [];
            }
          } else if (item.type === 'file') {
            try {
              // Fetch file content
              const contentResponse = await this.octokit.repos.getContent({
                owner,
                repo,
                path: item.path,
              });
              
              if ('content' in contentResponse.data) {
                const content = atob(contentResponse.data.content);
                node.content = content;
                
                // Analyze relationships
                node.relationships = await this.analyzeFileRelationships(
                  content,
                  item.path,
                  allFiles
                );
              }
            } catch (error) {
              console.warn(`Failed to fetch content of ${item.path}:`, error);
            }
          }

          allFiles.set(node.id, node);
          return node;
        })
      );

      return nodes;
    } catch (error) {
      const err = error as { status?: number; message?: string };
      if (err.status === 403 && err.message?.includes('rate limit')) {
        throw new Error(
          'GitHub API rate limit exceeded. Please ensure you have set up your GitHub token in the .env file.'
        );
      }
      console.error('Error fetching repository contents:', error);
      throw error;
    }
  }

  /**
   * Fetches repository data and builds the node structure
   * @param url GitHub repository URL
   * @returns Promise resolving to repository node structure
   */
  public async getRepositoryStructure(url: string): Promise<RepositoryNode[]> {
    try {
      const { owner, repo } = this.parseGitHubUrl(url);
      return await this.fetchContents(owner, repo);
    } catch (error) {
      console.error('Error getting repository structure:', error);
      throw error;
    }
  }

  /**
   * Fetches additional information about a specific file
   * @param url GitHub repository URL
   * @param path Path to the file
   * @returns Promise resolving to file information
   */
  public async getFileInfo(url: string, path: string): Promise<RepositoryNode> {
    try {
      const { owner, repo } = this.parseGitHubUrl(url);
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      const data = response.data as GitHubContentResponse;
      return {
        id: data.sha,
        name: data.name,
        type: 'file',
        path: data.path,
        size: data.size,
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      throw error;
    }
  }
}

export const githubService = new GitHubService(); 