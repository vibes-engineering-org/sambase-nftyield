import { PROJECT_TITLE } from "~/lib/constants";

export async function GET() {
  const appUrl =
    process.env.NEXT_PUBLIC_URL ||
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

  const config = {
    accountAssociation: "{\"accountAssociation\":{\"header\":\"eyJmaWQiOjEzMjg2MjcsInR5cGUiOiJhdXRoIiwia2V5IjoiMHhhOTY0MjcyMzA5MzQ3Y0EyRjIxNTNBZTI1Y0ZjMUNkQTBCODM3NTdGIn0\",\"payload\":\"eyJkb21haW4iOiJzYW1iYXNlLW5mdHlpZWxkLnZlcmNlbC5hcHAifQ\",\"signature\":\"bMJ3h9p4wPnW6U/6DdEPabONaxsOnnakISTcfB5VG88Zcb0H5osDnZP3GdniMsj8RWQDoHeAnzaE3C1e3yPMBRw=\"},\"miniapp\":{\"version\":\"1\",\"name\":\"NFTYield\",\"iconUrl\":\"https://sambase-nftyield.vercel.app/icon.png\",\"homeUrl\":\"https://sambase-nftyield.vercel.app\"}}",
    miniapp: {
      version: "1",
      name: PROJECT_TITLE,
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/frames/hello/opengraph-image`,
      ogImageUrl: `${appUrl}/frames/hello/opengraph-image`,
      buttonTitle: "Open",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      webhookUrl: `${appUrl}/api/webhook`,
      primaryCategory: "social",
    },
  };

  return Response.json(config);
}
