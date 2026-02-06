package org.hsbc.logging;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger log =
            LoggerFactory.getLogger(LoggingAspect.class);

    // 🔹 Apply to all controller & service methods
    @Pointcut("execution(* org.hsbc.controller..*(..)) || execution(* org.hsbc.service..*(..))")
    public void applicationMethods() {}

    @Around("applicationMethods()")
    public Object logMethodExecution(ProceedingJoinPoint joinPoint) throws Throwable {

        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();

        log.info("➡️ ENTER: {}.{}() with arguments = {}",
                className,
                methodName,
                joinPoint.getArgs());

        long start = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();

            long timeTaken = System.currentTimeMillis() - start;

            log.info("✅ EXIT: {}.{}() | Time = {} ms | Result = {}",
                    className,
                    methodName,
                    timeTaken,
                    result);

            return result;

        } catch (Exception ex) {

            log.error("❌ EXCEPTION in {}.{}() | Message = {}",
                    className,
                    methodName,
                    ex.getMessage(),
                    ex);

            throw ex;
        }
    }
}
