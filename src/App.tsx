import React, { useState, useEffect } from "react";
import { ChapterSidebar } from "./components/ChapterSidebar";
import { Editor } from "./components/Editor";
import { AIAssistant } from "./components/AIAssistant";
import { TableOfContents } from "./components/TableOfContents";
import { CollaboratorsList } from "./components/CollaboratorsList";
import { ThemeCustomizer } from "./components/ThemeCustomizer";
import { VersionControl } from "./components/VersionControl";
import { ThemeProvider } from "./components/hooks/useTheme";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import {
  FileText,
  Settings,
  Users,
  Hash,
  Bot,
  GitBranch,
  Plus,
  Search,
  PenTool,
  BookOpen,
  Lightbulb,
  Calendar,
  BarChart3,
  Menu,
  User,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  X,
  Filter,
  ArrowUpRight,
  Clock,
  Target,
  Star,
  Heart,
  Bookmark,
  Grid3x3,
  List,
  Eye,
  Edit3,
} from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  lastModified: Date;
  category: string;
  status: "draft" | "review" | "published";
  tags: string[];
  excerpt: string;
}

function AppContent() {
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: "1",
      title: "The Beginning",
      content: `# The Beginning

Welcome to Fiction Writer Pro!

## Getting Started

Create your own story here with our powerful AI-assisted writing tools.`,
      wordCount: 18,
      lastModified: new Date(),
      category: "fiction",
      status: "draft",
      tags: ["intro", "novel"],
      excerpt:
        "Welcome to Fiction Writer Pro! A powerful platform for creative writing.",
    },
    {
      id: "2",
      title: "Character Development",
      content: `# Character Development

Building compelling characters is the foundation of great storytelling.

## Protagonist Design

Creating memorable characters that readers will connect with.`,
      wordCount: 32,
      lastModified: new Date(Date.now() - 86400000),
      category: "character",
      status: "review",
      tags: ["character", "development"],
      excerpt:
        "Building compelling characters is the foundation of great storytelling.",
    },
    {
      id: "3",
      title: "World Building",
      content: `# World Building

Crafting immersive worlds that feel authentic and lived-in.

## Setting the Stage

Every detail matters when creating believable environments.`,
      wordCount: 28,
      lastModified: new Date(Date.now() - 172800000),
      category: "worldbuilding",
      status: "published",
      tags: ["world", "setting"],
      excerpt:
        "Crafting immersive worlds that feel authentic and lived-in.",
    },
    {
      id: "4",
      title: "Plot Structure",
      content: `# Plot Structure

Understanding the three-act structure and narrative flow.

## Story Arc

Building tension and resolution throughout your narrative.`,
      wordCount: 24,
      lastModified: new Date(Date.now() - 259200000),
      category: "plotting",
      status: "draft",
      tags: ["plot", "structure"],
      excerpt:
        "Understanding the three-act structure and narrative flow.",
    },
    {
      id: "5",
      title: "Dialogue Mastery",
      content: `# Dialogue Mastery

Writing natural, engaging conversations between characters.

## Voice and Tone

Each character should have a distinct speaking style.`,
      wordCount: 26,
      lastModified: new Date(Date.now() - 345600000),
      category: "craft",
      status: "review",
      tags: ["dialogue", "voice"],
      excerpt:
        "Writing natural, engaging conversations between characters.",
    },
    {
      id: "6",
      title: "Research Methods",
      content: `# Research Methods

Gathering authentic details to enhance your storytelling.

## Source Verification

Ensuring accuracy in historical and technical details.`,
      wordCount: 22,
      lastModified: new Date(Date.now() - 432000000),
      category: "research",
      status: "published",
      tags: ["research", "accuracy"],
      excerpt:
        "Gathering authentic details to enhance your storytelling.",
    },
  ]);

  const [currentChapterId, setCurrentChapterId] = useState("1");
  const [currentView, setCurrentView] = useState<
    "home" | "editor"
  >("home");
  const [activePanel, setActivePanel] = useState<
    | "chapters"
    | "toc"
    | "collaborators"
    | "ai"
    | "settings"
    | "version"
    | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("all");
  const [selectedStatus, setSelectedStatus] =
    useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">(
    "grid",
  );

  const currentChapter = chapters.find(
    (c) => c.id === currentChapterId,
  );

  const categories = [
    {
      id: "all",
      label: "All Categories",
      count: chapters.length,
    },
    {
      id: "fiction",
      label: "Fiction",
      count: chapters.filter((c) => c.category === "fiction")
        .length,
    },
    {
      id: "character",
      label: "Character",
      count: chapters.filter((c) => c.category === "character")
        .length,
    },
    {
      id: "worldbuilding",
      label: "World Building",
      count: chapters.filter(
        (c) => c.category === "worldbuilding",
      ).length,
    },
    {
      id: "plotting",
      label: "Plot & Structure",
      count: chapters.filter((c) => c.category === "plotting")
        .length,
    },
    {
      id: "craft",
      label: "Writing Craft",
      count: chapters.filter((c) => c.category === "craft")
        .length,
    },
    {
      id: "research",
      label: "Research",
      count: chapters.filter((c) => c.category === "research")
        .length,
    },
  ];

  const statuses = [
    { id: "all", label: "All Status" },
    { id: "draft", label: "Draft" },
    { id: "review", label: "In Review" },
    { id: "published", label: "Published" },
  ];

  const filteredChapters = chapters.filter((chapter) => {
    const matchesSearch =
      chapter.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      chapter.content
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      chapter.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    const matchesCategory =
      selectedCategory === "all" ||
      chapter.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" ||
      chapter.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleNewChapter = () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: `New Chapter ${chapters.length + 1}`,
      content: "",
      wordCount: 0,
      lastModified: new Date(),
      category: "fiction",
      status: "draft",
      tags: [],
      excerpt: "Start writing your new chapter...",
    };
    setChapters([...chapters, newChapter]);
    setCurrentChapterId(newChapter.id);
    setCurrentView("editor");
  };

  const handleContentChange = (content: string) => {
    if (!currentChapter) return;

    const wordCount = content.trim()
      ? content.trim().split(/\s+/).length
      : 0;
    const excerpt =
      content.replace(/[#*]/g, "").substring(0, 100) + "...";

    setChapters(
      chapters.map((c) =>
        c.id === currentChapterId
          ? {
              ...c,
              content,
              wordCount,
              excerpt,
              lastModified: new Date(),
            }
          : c,
      ),
    );
  };

  const handleChapterSelect = (chapterId: string) => {
    setCurrentChapterId(chapterId);
    setCurrentView("editor");
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (chapters.length <= 1) return;

    const newChapters = chapters.filter(
      (c) => c.id !== chapterId,
    );
    setChapters(newChapters);

    if (currentChapterId === chapterId) {
      setCurrentChapterId(newChapters[0].id);
    }
  };

  const handleRenameChapter = (
    chapterId: string,
    newTitle: string,
  ) => {
    setChapters(
      chapters.map((c) =>
        c.id === chapterId
          ? { ...c, title: newTitle, lastModified: new Date() }
          : c,
      ),
    );
  };

  const totalWordCount = chapters.reduce(
    (sum, chapter) => sum + chapter.wordCount,
    0,
  );

  const renderPanelContent = () => {
    if (!activePanel) return null;

    switch (activePanel) {
      case "chapters":
        return (
          <ChapterSidebar
            chapters={chapters}
            currentChapterId={currentChapterId}
            onChapterSelect={handleChapterSelect}
            onAddChapter={handleNewChapter}
            onDeleteChapter={handleDeleteChapter}
            onRenameChapter={handleRenameChapter}
          />
        );
      case "toc":
        return currentChapter ? (
          <TableOfContents content={currentChapter.content} />
        ) : null;
      case "ai":
        return <AIAssistant />;
      case "collaborators":
        return (
          <CollaboratorsList documentId={currentChapterId} />
        );
      case "version":
        return currentChapter ? (
          <VersionControl
            documentId={currentChapterId}
            content={currentChapter.content}
            onContentChange={handleContentChange}
          />
        ) : null;
      case "settings":
        return <ThemeCustomizer />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "Draft";
      case "review":
        return "Review";
      case "published":
        return "Published";
      default:
        return status;
    }
  };

  const renderHomeView = () => {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-background border-b border-border px-12 py-8">
          <div className="flex items-center justify-between max-w-[1400px] mx-auto">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                  <PenTool className="w-4 h-4 text-background" />
                </div>
                <div>
                  <h1 className="minimal-serif text-xl font-semibold text-foreground">
                    Fiction Writer Pro
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Minimal writing workspace
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Button
                onClick={handleNewChapter}
                className="bg-foreground hover:bg-foreground/90 text-background px-6 py-2 text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Chapter
              </Button>
            </div>
          </div>
        </header>

        <div className="flex max-w-[1400px] mx-auto">
          {/* Sidebar */}
          <div className="w-72 minimal-sidebar p-8">
            <div className="space-y-8">
              {/* Search */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Search
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    className="pl-10 bg-card border-border rounded-lg"
                  />
                </div>
              </div>

              {/* View Mode */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">
                  View
                </h3>
                <div className="flex gap-1 p-1 bg-secondary rounded-lg">
                  <Button
                    onClick={() => setViewMode("grid")}
                    variant="ghost"
                    size="sm"
                    className={`flex-1 text-xs ${
                      viewMode === "grid"
                        ? "bg-background shadow-sm"
                        : ""
                    }`}
                  >
                    <Grid3x3 className="w-3 h-3 mr-2" />
                    Grid
                  </Button>
                  <Button
                    onClick={() => setViewMode("list")}
                    variant="ghost"
                    size="sm"
                    className={`flex-1 text-xs ${
                      viewMode === "list"
                        ? "bg-background shadow-sm"
                        : ""
                    }`}
                  >
                    <List className="w-3 h-3 mr-2" />
                    List
                  </Button>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() =>
                        setSelectedCategory(category.id)
                      }
                      className={`
                        flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors text-sm
                        ${
                          selectedCategory === category.id
                            ? "bg-foreground text-background"
                            : "hover:bg-secondary"
                        }
                      `}
                    >
                      <span>{category.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {category.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Status
                </h3>
                <div className="space-y-2">
                  {statuses.map((status) => (
                    <div
                      key={status.id}
                      onClick={() =>
                        setSelectedStatus(status.id)
                      }
                      className={`
                        flex items-center p-3 rounded-lg cursor-pointer transition-colors text-sm
                        ${
                          selectedStatus === status.id
                            ? "bg-foreground text-background"
                            : "hover:bg-secondary"
                        }
                      `}
                    >
                      <span>{status.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Tools */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Tools
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      id: "ai",
                      icon: Bot,
                      label: "AI Assistant",
                      action: () => setActivePanel("ai"),
                    },
                    {
                      id: "version",
                      icon: GitBranch,
                      label: "Version Control",
                      action: () => setActivePanel("version"),
                    },
                    {
                      id: "collab",
                      icon: Users,
                      label: "Collaboration",
                      action: () =>
                        setActivePanel("collaborators"),
                    },
                    {
                      id: "settings",
                      icon: Settings,
                      label: "Settings",
                      action: () => setActivePanel("settings"),
                    },
                  ].map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <div
                        key={tool.id}
                        onClick={tool.action}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors text-sm
                          ${
                            activePanel === tool.id
                              ? "bg-foreground text-background"
                              : "hover:bg-secondary"
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tool.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="pt-6 border-t border-border">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Chapters
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {chapters.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Words
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {totalWordCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-12 py-8">
            <div className="max-w-5xl">
              {/* Page Header */}
              <div className="mb-12">
                <h2 className="minimal-serif minimal-section-header">
                  Writing Dashboard
                </h2>
                <p className="text-muted-foreground text-base">
                  Manage and organize your creative works
                </p>
              </div>

              {/* Chapter Content */}
              {viewMode === "grid" ? (
                <div className="minimal-grid">
                  {filteredChapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="minimal-card group cursor-pointer"
                      onClick={() =>
                        handleChapterSelect(chapter.id)
                      }
                    >
                      <div className="flex flex-col h-full">
                        <div className="mb-6">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="minimal-serif text-xl font-semibold text-foreground leading-tight">
                              {chapter.title}
                            </h3>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {chapter.excerpt}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                          <span className="minimal-tag">
                            {getStatusLabel(chapter.status)}
                          </span>
                          {chapter.tags
                            .slice(0, 2)
                            .map((tag, index) => (
                              <span
                                key={index}
                                className="minimal-tag"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 border-t border-border">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {chapter.wordCount} words
                            </span>
                            <span>
                              {chapter.lastModified.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add New Card */}
                  <div
                    onClick={handleNewChapter}
                    className="minimal-card border-dashed border-2 border-border hover:border-foreground cursor-pointer flex flex-col items-center justify-center text-center py-20 group"
                  >
                    <Plus className="w-6 h-6 text-muted-foreground group-hover:text-foreground mb-4 transition-colors" />
                    <h3 className="minimal-serif text-lg font-medium text-muted-foreground group-hover:text-foreground mb-2 transition-colors">
                      New Chapter
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Start writing
                    </p>
                  </div>
                </div>
              ) : (
                <div className="minimal-list">
                  {filteredChapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="minimal-card group cursor-pointer"
                      onClick={() =>
                        handleChapterSelect(chapter.id)
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="minimal-serif text-xl font-semibold text-foreground">
                              {chapter.title}
                            </h3>
                            <span className="minimal-tag">
                              {getStatusLabel(chapter.status)}
                            </span>
                            {chapter.tags
                              .slice(0, 2)
                              .map((tag, index) => (
                                <span
                                  key={index}
                                  className="minimal-tag"
                                >
                                  {tag}
                                </span>
                              ))}
                          </div>
                          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                            {chapter.excerpt}
                          </p>
                          <div className="flex items-center gap-6 text-xs text-muted-foreground">
                            <span>
                              {chapter.wordCount} words
                            </span>
                            <span>
                              {chapter.lastModified.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          {activePanel && (
            <div className="w-80 bg-background border-l border-border p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="minimal-serif text-lg font-semibold text-foreground">
                  {activePanel === "ai" && "AI Assistant"}
                  {activePanel === "version" &&
                    "Version Control"}
                  {activePanel === "collaborators" &&
                    "Collaboration"}
                  {activePanel === "settings" && "Settings"}
                </h3>
                <Button
                  onClick={() => setActivePanel(null)}
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 hover:bg-secondary"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {renderPanelContent()}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEditorView = () => {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-background border-b border-border px-8 py-6">
          <div className="flex items-center justify-between max-w-[1400px] mx-auto">
            <div className="flex items-center gap-6">
              <Button
                onClick={() => setCurrentView("home")}
                variant="ghost"
                size="sm"
                className="hover:bg-secondary"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="h-4 w-px bg-border" />
              <div>
                <h1 className="minimal-serif text-lg font-semibold text-foreground">
                  {currentChapter?.title}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {currentChapter?.wordCount} words · {currentChapter?.lastModified.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() =>
                  setActivePanel(
                    activePanel === "toc" ? null : "toc",
                  )
                }
                variant={
                  activePanel === "toc" ? "default" : "ghost"
                }
                size="sm"
                className={activePanel === "toc" ? "bg-foreground text-background" : "hover:bg-secondary"}
              >
                <Hash className="w-4 h-4 mr-2" />
                Contents
              </Button>
              <Button
                onClick={() =>
                  setActivePanel(
                    activePanel === "ai" ? null : "ai",
                  )
                }
                variant={
                  activePanel === "ai" ? "default" : "ghost"
                }
                size="sm"
                className={activePanel === "ai" ? "bg-foreground text-background" : "hover:bg-secondary"}
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Assistant
              </Button>
              <Button
                onClick={handleNewChapter}
                className="bg-foreground hover:bg-foreground/90 text-background px-4"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Chapter
              </Button>
            </div>
          </div>
        </header>

        <div className="flex max-w-[1400px] mx-auto">
          {/* Side Panel */}
          {activePanel && (
            <div className="w-72 bg-background border-r border-border">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="minimal-serif font-semibold text-foreground">
                    {activePanel === "toc" &&
                      "Contents"}
                    {activePanel === "ai" && "AI Assistant"}
                    {activePanel === "collaborators" &&
                      "Collaboration"}
                    {activePanel === "version" &&
                      "Version Control"}
                    {activePanel === "settings" && "Settings"}
                  </h3>
                  <Button
                    onClick={() => setActivePanel(null)}
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 hover:bg-secondary"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {renderPanelContent()}
              </div>
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 h-screen overflow-hidden">
            {currentChapter && (
              <Editor
                content={currentChapter.content}
                onChange={handleContentChange}
                currentChapter={currentChapter.title}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  if (currentView === "editor") {
    return renderEditorView();
  }

  return renderHomeView();
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}