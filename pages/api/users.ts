import { NextApiRequest, NextApiResponse } from "next";
import isEmpty from "lodash/isEmpty";
import nc from "next-connect";
import prisma, { Prisma } from "@db";
import { getSession } from "@lib/auth/session";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  let selectInput;
  let whereInput;
  let includeInput;
  let orderByInput;
  let cursorInput;
  let takeInput;
  let skipInput;
  let distinctInput;

  // That's a temporary (famous last words) fix, as body is not send anymore via GET request
  if (req.method === "GET") {
    selectInput = isEmpty(req.query?.select) ? undefined : JSON.parse(<string>req.query?.select);
  } else {
    selectInput = isEmpty(req.body?.select) ? undefined : req.body?.select;
    whereInput = isEmpty(req.body?.where) ? undefined : req.body?.where;
    includeInput = isEmpty(req.body?.include) ? undefined : req.body?.include;
    orderByInput = isEmpty(req.body?.orderBy) ? undefined : req.body?.orderBy;
    cursorInput = isEmpty(req.body?.cursor) ? undefined : req.body?.cursor;
    takeInput = isEmpty(req.body?.take) ? undefined : req.body?.take;
    skipInput = isEmpty(req.body?.skip) ? undefined : req.body?.skip;
    distinctInput = isEmpty(req.body?.distinct) ? undefined : req.body?.distinct;
  }

  const findManyArgs: Prisma.UserFindManyArgs = {
    select: selectInput,
    where: whereInput,
    include: includeInput,
    orderBy: orderByInput,
    cursor: cursorInput,
    take: takeInput,
    skip: skipInput,
    distinct: distinctInput,
  };

  try {
    const users = await prisma.user.findMany(findManyArgs);

    console.log({ users, findManyArgs, req: req.query });

    return res.status(200).json(users);
  } catch (error) {
    console.error("[api] user", error);
    return res.status(500).json({ statusCode: 500, message: error.message });
  }
};

export default nc().get(handler);
