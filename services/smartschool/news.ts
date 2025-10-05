import { SmartSchool } from "smartschooljs";

import { AttachmentType } from "../shared/attachment";
import { News } from "../shared/news";

export async function fetchSkolengoNews(session: SmartSchool, accountId: string): Promise<News[]> {
  const news = await session.GetNews()
  return news.map(item => ({
    id: item.id,
    title: item.title,
    createdAt: item.publicationDateTime,
    acknowledged: true,
    content: item.content,
    author: item.author.name,
    category: "Actualités",
    attachments: [{
      type: AttachmentType.FILE,
      name: item.illustration.fileName ?? "",
      url: item.illustration.url,
      createdByAccount: accountId
    },
    {
      type: AttachmentType.LINK,
      name: item.linkedWebSiteUrl ?? "",
      url: item.linkedWebSiteUrl ?? "",
      createdByAccount: accountId
    }].filter(attachment => attachment.name && attachment.url),
    createdByAccount: accountId
  }));
}