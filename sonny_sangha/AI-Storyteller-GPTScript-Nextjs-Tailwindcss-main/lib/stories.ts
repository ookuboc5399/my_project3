import fs from "fs";
import path from "path";
import { Story, Page } from "../types/stories";
import cleanTitle from "./cleanTitle";

const storiesDirectory = path.join(process.cwd(), "public/stories");

export function getAllStories(): Story[] {
  if (!fs.existsSync(storiesDirectory)) {
    return [];
  }

  const storyFolders = fs.readdirSync(storiesDirectory);
  const stories: Story[] = storyFolders.map((storyFolder) => {
    const storyPath = path.join(storiesDirectory, storyFolder);
    const files = fs.readdirSync(storyPath);

    // Group files by page number
    const pages: Page[] = [];
    const pageMap: { [key: string]: Partial<Page> } = {};

    files.forEach((file) => {
      const filePath = path.join(storyPath, file);
      const type = path.extname(file).substring(1);
      const pageNumber = file.match(/page(\d+)\./)?.[1];

      if (pageNumber) {
        if (!pageMap[pageNumber]) {
          pageMap[pageNumber] = {};
        }

        if (type === "txt") {
          pageMap[pageNumber].txt = fs.readFileSync(filePath, "utf-8");
        } else if (type === "png") {
          pageMap[pageNumber].png = `/stories/${storyFolder}/${file}`;
        }
      }
    });

    Object.keys(pageMap).forEach((pageNumber) => {
      if (pageMap[pageNumber].txt && pageMap[pageNumber].png) {
        pages.push(pageMap[pageNumber] as Page);
      }
    });

    return {
      story: cleanTitle(storyFolder),
      pages: pages,
    };
  });

  // filter any stories with zero pages
  const storiesWithPages = stories.filter((story) => story.pages.length > 0);

  return storiesWithPages;
}

export const getStory = (story: string): Story | undefined => {
  const stories = getAllStories();
  return stories.find((s) => s.story === story);
};
