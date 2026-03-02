import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = await params;

  return (
    <article className="min-h-screen bg-background p-6 md:p-12 lg:p-24">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/news">&larr; Back to News</Link>
          </Button>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Dynamic News Title
          </h1>
          <p className="text-sm text-muted-foreground">
            Published on: Oct 24, 2024
          </p>
          <p className="text-xs text-muted-foreground">
            Article ID: {unwrappedParams.id}
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>
            This is the detailed content of the news article. It will eventually
            be populated dynamically from the Appwrite database using the ID
            provided in the route parameters.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </div>
    </article>
  );
}
