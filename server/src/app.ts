import cookieParser from 'cookie-parser';
import e, { ErrorRequestHandler } from 'express';
import createHttpError from 'http-errors';
import morgan from 'morgan';
import path from 'path';
import router from './router';

const app = e();

app.use(e.json());
app.use(e.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
if (app.get('env') !== 'production') app.use(e.static(path.join(__dirname, '..', 'public')));
if (app.get('env') === 'production')
  app.use(e.static(path.join(__dirname, '..', '..', 'client', 'build')));

app.use('/', router);

if (app.get('env') === 'production')
  app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, '..', '..', 'client', 'build', 'index.html'));
  });

// catch 404 and forward to error handler
app.use(async (req, res, next) => {
  next(createHttpError(404));
});

// error handler
app.use((async (err, req, res, next) => {
  // set locals, only providing error in development
  const error = [
    {
      name: err.name,
      msg: err.message,
      ...(req.app.get('env') === 'development' ? { stack: err.stack, err } : {}),
    },
  ];
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.err = error;

  // render the error page
  res.status(err.status || 500);
  next();
}) as ErrorRequestHandler);
app.use((req, res) => {
  res.json(res.locals.err);
});

export default app;
