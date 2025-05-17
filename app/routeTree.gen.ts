/* eslint-disable */





import { Route as rootRoute } from './routes/__root'
import { Route as BlogRouteImport } from './routes/_blog/route'
import { Route as IndexImport } from './routes/index'
import { Route as AboutIndexImport } from './routes/about.index'
import { Route as AboutLangImport } from './routes/about.$lang'
import { Route as BlogArchiveRouteImport } from './routes/_blog/_archive.route'
import { Route as BlogArchivePostIndexImport } from './routes/_blog/_archive.post.index'
import { Route as BlogPostLangSlugImport } from './routes/_blog/post.$lang.$slug'
import { Route as BlogArchivePostLangIndexImport } from './routes/_blog/_archive.post.$lang.index'


const BlogRouteRoute = BlogRouteImport.update({
  id: '/_blog',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const AboutIndexRoute = AboutIndexImport.update({
  id: '/about/',
  path: '/about/',
  getParentRoute: () => rootRoute,
} as any)

const AboutLangRoute = AboutLangImport.update({
  id: '/about/$lang',
  path: '/about/$lang',
  getParentRoute: () => rootRoute,
} as any)

const BlogArchiveRouteRoute = BlogArchiveRouteImport.update({
  id: '/_archive',
  getParentRoute: () => BlogRouteRoute,
} as any)

const BlogArchivePostIndexRoute = BlogArchivePostIndexImport.update({
  id: '/post/',
  path: '/post/',
  getParentRoute: () => BlogArchiveRouteRoute,
} as any)

const BlogPostLangSlugRoute = BlogPostLangSlugImport.update({
  id: '/post/$lang/$slug',
  path: '/post/$lang/$slug',
  getParentRoute: () => BlogRouteRoute,
} as any)

const BlogArchivePostLangIndexRoute = BlogArchivePostLangIndexImport.update({
  id: '/post/$lang/',
  path: '/post/$lang/',
  getParentRoute: () => BlogArchiveRouteRoute,
} as any)


declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/_blog': {
      id: '/_blog'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof BlogRouteImport
      parentRoute: typeof rootRoute
    }
    '/_blog/_archive': {
      id: '/_blog/_archive'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof BlogArchiveRouteImport
      parentRoute: typeof BlogRouteImport
    }
    '/about/$lang': {
      id: '/about/$lang'
      path: '/about/$lang'
      fullPath: '/about/$lang'
      preLoaderRoute: typeof AboutLangImport
      parentRoute: typeof rootRoute
    }
    '/about/': {
      id: '/about/'
      path: '/about'
      fullPath: '/about'
      preLoaderRoute: typeof AboutIndexImport
      parentRoute: typeof rootRoute
    }
    '/_blog/post/$lang/$slug': {
      id: '/_blog/post/$lang/$slug'
      path: '/post/$lang/$slug'
      fullPath: '/post/$lang/$slug'
      preLoaderRoute: typeof BlogPostLangSlugImport
      parentRoute: typeof BlogRouteImport
    }
    '/_blog/_archive/post/': {
      id: '/_blog/_archive/post/'
      path: '/post'
      fullPath: '/post'
      preLoaderRoute: typeof BlogArchivePostIndexImport
      parentRoute: typeof BlogArchiveRouteImport
    }
    '/_blog/_archive/post/$lang/': {
      id: '/_blog/_archive/post/$lang/'
      path: '/post/$lang'
      fullPath: '/post/$lang'
      preLoaderRoute: typeof BlogArchivePostLangIndexImport
      parentRoute: typeof BlogArchiveRouteImport
    }
  }
}


interface BlogArchiveRouteRouteChildren {
  BlogArchivePostIndexRoute: typeof BlogArchivePostIndexRoute
  BlogArchivePostLangIndexRoute: typeof BlogArchivePostLangIndexRoute
}

const BlogArchiveRouteRouteChildren: BlogArchiveRouteRouteChildren = {
  BlogArchivePostIndexRoute: BlogArchivePostIndexRoute,
  BlogArchivePostLangIndexRoute: BlogArchivePostLangIndexRoute,
}

const BlogArchiveRouteRouteWithChildren =
  BlogArchiveRouteRoute._addFileChildren(BlogArchiveRouteRouteChildren)

interface BlogRouteRouteChildren {
  BlogArchiveRouteRoute: typeof BlogArchiveRouteRouteWithChildren
  BlogPostLangSlugRoute: typeof BlogPostLangSlugRoute
}

const BlogRouteRouteChildren: BlogRouteRouteChildren = {
  BlogArchiveRouteRoute: BlogArchiveRouteRouteWithChildren,
  BlogPostLangSlugRoute: BlogPostLangSlugRoute,
}

const BlogRouteRouteWithChildren = BlogRouteRoute._addFileChildren(
  BlogRouteRouteChildren,
)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '': typeof BlogArchiveRouteRouteWithChildren
  '/about/$lang': typeof AboutLangRoute
  '/about': typeof AboutIndexRoute
  '/post/$lang/$slug': typeof BlogPostLangSlugRoute
  '/post': typeof BlogArchivePostIndexRoute
  '/post/$lang': typeof BlogArchivePostLangIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '': typeof BlogArchiveRouteRouteWithChildren
  '/about/$lang': typeof AboutLangRoute
  '/about': typeof AboutIndexRoute
  '/post/$lang/$slug': typeof BlogPostLangSlugRoute
  '/post': typeof BlogArchivePostIndexRoute
  '/post/$lang': typeof BlogArchivePostLangIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/_blog': typeof BlogRouteRouteWithChildren
  '/_blog/_archive': typeof BlogArchiveRouteRouteWithChildren
  '/about/$lang': typeof AboutLangRoute
  '/about/': typeof AboutIndexRoute
  '/_blog/post/$lang/$slug': typeof BlogPostLangSlugRoute
  '/_blog/_archive/post/': typeof BlogArchivePostIndexRoute
  '/_blog/_archive/post/$lang/': typeof BlogArchivePostLangIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | ''
    | '/about/$lang'
    | '/about'
    | '/post/$lang/$slug'
    | '/post'
    | '/post/$lang'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | ''
    | '/about/$lang'
    | '/about'
    | '/post/$lang/$slug'
    | '/post'
    | '/post/$lang'
  id:
    | '__root__'
    | '/'
    | '/_blog'
    | '/_blog/_archive'
    | '/about/$lang'
    | '/about/'
    | '/_blog/post/$lang/$slug'
    | '/_blog/_archive/post/'
    | '/_blog/_archive/post/$lang/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  BlogRouteRoute: typeof BlogRouteRouteWithChildren
  AboutLangRoute: typeof AboutLangRoute
  AboutIndexRoute: typeof AboutIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  BlogRouteRoute: BlogRouteRouteWithChildren,
  AboutLangRoute: AboutLangRoute,
  AboutIndexRoute: AboutIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/_blog",
        "/about/$lang",
        "/about/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/_blog": {
      "filePath": "_blog/route.tsx",
      "children": [
        "/_blog/_archive",
        "/_blog/post/$lang/$slug"
      ]
    },
    "/_blog/_archive": {
      "filePath": "_blog/_archive.route.tsx",
      "parent": "/_blog",
      "children": [
        "/_blog/_archive/post/",
        "/_blog/_archive/post/$lang/"
      ]
    },
    "/about/$lang": {
      "filePath": "about.$lang.tsx"
    },
    "/about/": {
      "filePath": "about.index.tsx"
    },
    "/_blog/post/$lang/$slug": {
      "filePath": "_blog/post.$lang.$slug.tsx",
      "parent": "/_blog"
    },
    "/_blog/_archive/post/": {
      "filePath": "_blog/_archive.post.index.tsx",
      "parent": "/_blog/_archive"
    },
    "/_blog/_archive/post/$lang/": {
      "filePath": "_blog/_archive.post.$lang.index.tsx",
      "parent": "/_blog/_archive"
    }
  }
}
ROUTE_MANIFEST_END */
